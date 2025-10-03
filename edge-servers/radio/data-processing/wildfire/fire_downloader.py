#!/usr/bin/env python3
"""
NASA Fire Data Downloader - Real-time API Version
Downloads latest fire detection data from NASA FIRMS API for hourly cron jobs
"""

import requests
import os
from datetime import datetime, timedelta, date
from typing import List, Dict, Optional, Tuple
from pathlib import Path
import logging
from dataclasses import dataclass


@dataclass
class FireDataFile:
    """Represents a fire data file to download"""
    url: str
    filename: str
    satellite: str
    date: date
    file_type: str  # 'MODIS' or 'VIIRS'


class NASAFireDownloader:
    """
    NASA FIRMS fire data downloader optimized for hourly cron jobs
    Uses API calls to get the latest real-time fire detection data
    """
    
    def __init__(self, download_dir: str = "downloads", api_key: str = None):
        self.download_dir = Path(download_dir)
        self.download_dir.mkdir(exist_ok=True)
        
        self.logger = logging.getLogger(__name__)
        
        # NASA FIRMS API endpoints for real-time data (correct format)
        self.API_BASE_URL = 'https://firms.modaps.eosdis.nasa.gov/api/area/csv'
        
        # API URL templates for different satellites and regions
        # Format: /api/area/csv/[MAP_KEY]/[SOURCE]/[AREA_COORDINATES]/[DAY_RANGE]
        self.API_URLS = {
            'MODIS': '{api_key}/MODIS_NRT/{area_coords}/1',
            'VIIRS': '{api_key}/VIIRS_SNPP_NRT/{area_coords}/1'
        }
        
        # Direct file download URLs (fallback when API key is not available)
        self.FILE_URLS = {
            'MODIS': 'https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_Global_24h.csv',
            'VIIRS': 'https://firms.modaps.eosdis.nasa.gov/data/active_fire/viirs-c2/csv/VNP14IMGTDL_NRT_Global_24h.csv'
        }
        
        # Set up session for connection reuse
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'NSAC-Wildfire-Monitor/1.0'
        })
        
        # Add API key if provided
        self.api_key = api_key or os.getenv('NASA_FIRMS_API_KEY')
        if self.api_key:
            self.logger.info("🔑 NASA FIRMS API key loaded from environment")
        else:
            self.logger.warning("⚠️ No NASA FIRMS API key found - will use direct file downloads")
            self.logger.info("   Set NASA_FIRMS_API_KEY in .env file for better data access")
        
        # Set up logging
        self.logger = logging.getLogger(__name__)
        
        # Track processed data to avoid duplicates
        self.processed_data_cache = set()
    
    def download_latest_hourly_data(self, satellite: str = 'VIIRS') -> List[str]:
        """
        Download the latest available fire data (API or direct file download)
        Automatically finds the most recent data available
        
        Args:
            satellite: 'MODIS', 'VIIRS', or 'ALL' (default: 'VIIRS' for better performance)
            
        Returns:
            List of downloaded file paths
        """
        if self.api_key:
            self.logger.info("🕐 Downloading latest hourly fire data via API (cron job mode)")
            return self._download_via_api(satellite)
        else:
            self.logger.info("🕐 Downloading latest fire data via direct file download (fallback mode)")
            return self._download_via_files(satellite)
    
    def _download_via_api(self, satellite: str = 'VIIRS') -> List[str]:
        """Download fire data via NASA FIRMS API"""
        downloaded_files = []
        
        # Determine which satellites to download (default to VIIRS only for better performance)
        satellites = ['VIIRS'] if satellite == 'ALL' else [satellite]
        
        for sat in satellites:
            self.logger.info(f"📡 Downloading {sat} fire data via API...")
            
            # Download global data and filter for North America ourselves
            # This ensures we don't miss fires due to bounding box issues
            area_coords = "world"  # Use "world" instead of coordinates
            file_path = self.download_fire_data_via_api(sat, area_coords)
            
            if file_path:
                self.logger.info(f"✅ Downloaded {sat} global data (filtered for North America)")
                downloaded_files.append(file_path)
            else:
                self.logger.warning(f"❌ No {sat} data available globally")
        
        if downloaded_files:
            self.logger.info(f"✅ Downloaded {len(downloaded_files)} fire data files via API")
        else:
            self.logger.warning("❌ No recent fire data available via API")
        
        return downloaded_files
    
    def _download_via_files(self, satellite: str = 'VIIRS') -> List[str]:
        """Download fire data via direct file downloads (fallback method)"""
        downloaded_files = []
        
        # Determine which satellites to download (default to VIIRS only for better performance)
        satellites = ['VIIRS'] if satellite == 'ALL' else [satellite]
        
        for sat in satellites:
            self.logger.info(f"📡 Downloading {sat} fire data via direct file download...")
            
            file_path = self.download_fire_data_via_file(sat)
            
            if file_path:
                self.logger.info(f"✅ Downloaded {sat} data file")
                downloaded_files.append(file_path)
            else:
                self.logger.warning(f"❌ Failed to download {sat} data file")
        
        if downloaded_files:
            self.logger.info(f"✅ Downloaded {len(downloaded_files)} fire data files via direct download")
        else:
            self.logger.warning("❌ No fire data files downloaded")
        
        return downloaded_files
    
    def _filter_for_north_america(self, csv_content: str) -> str:
        """
        Filter CSV content for North America region
        
        Args:
            csv_content: Raw CSV content from API
            
        Returns:
            Filtered CSV content for North America only
        """
        lines = csv_content.strip().split('\n')
        if len(lines) <= 1:
            return csv_content  # Return as-is if no data rows
        
        header = lines[0]
        filtered_lines = [header]
        
        # North America bounds: west, south, east, north
        # -180, 15, -50, 85 (covering USA, Canada, Mexico, Central America)
        west_bound, south_bound, east_bound, north_bound = -180, 15, -50, 85
        
        for line in lines[1:]:
            if not line.strip():
                continue
                
            try:
                # Parse CSV line to get latitude and longitude
                parts = line.split(',')
                if len(parts) >= 2:
                    latitude = float(parts[0])
                    longitude = float(parts[1])
                    
                    # Check if point is within North America bounds
                    if (south_bound <= latitude <= north_bound and 
                        west_bound <= longitude <= east_bound):
                        filtered_lines.append(line)
            except (ValueError, IndexError):
                # Skip malformed lines
                continue
        
        return '\n'.join(filtered_lines)
    
    def download_fire_data_via_api(self, satellite: str = 'VIIRS', area_coords: str = '-180,15,-50,85') -> Optional[str]:
        """
        Download fire data via NASA FIRMS API (24-hour rolling window)
        
        Args:
            satellite: 'MODIS' or 'VIIRS'
            area_coords: Area coordinates in format 'west,south,east,north'
            
        Returns:
            Path to downloaded file or None if failed
        """
        try:
            if not self.api_key:
                self.logger.error("API key required for NASA FIRMS API access")
                return None
            
            # Build the correct API URL using the template format
            # Format: /api/area/csv/[MAP_KEY]/[SOURCE]/[AREA_COORDINATES]/[DAY_RANGE]
            url_template = self.API_URLS[satellite]
            api_url = f"{self.API_BASE_URL}/{url_template.format(api_key=self.api_key, area_coords=area_coords)}"
            
            self.logger.debug(f"API request: {api_url}")
            
            # Make API request (no additional parameters needed for 24h data)
            response = self.session.get(api_url, timeout=60)
            response.raise_for_status()
            
            # Check if we got actual data (not just headers)
            content = response.text.strip()
            if not content or len(content.split('\n')) <= 1:
                self.logger.debug(f"No {satellite} data available for {area_coords}")
                return None
            
            # Save response to file with timestamp
            timestamp = datetime.now().strftime('%Y%m%d_%H%M')
            filename = f"{satellite}_global_24h_{timestamp}.csv"
            file_path = self.download_dir / filename
            
            # Filter for North America before saving
            filtered_content = self._filter_for_north_america(content)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(filtered_content)
            
            # Verify file size and content
            file_size = file_path.stat().st_size
            if file_size == 0:
                self.logger.error(f"API response is empty: {filename}")
                file_path.unlink()
                return None
            
            # Count lines to verify we have actual data
            with open(file_path, 'r') as f:
                lines = f.readlines()
            
            if len(lines) <= 1:  # Only header or empty
                self.logger.debug(f"No fire detections in {filename}")
                file_path.unlink()
                return None
            
            # Check for new data to avoid duplicates
            data_hash = self._calculate_data_hash(content)
            if data_hash in self.processed_data_cache:
                self.logger.info(f"Data already processed, skipping: {filename}")
                file_path.unlink()
                return None
            
            # Add to processed cache
            self.processed_data_cache.add(data_hash)
            
            self.logger.info(f"Downloaded via API: {filename} ({file_size:,} bytes, {len(lines)-1} detections)")
            return str(file_path)
            
        except requests.exceptions.RequestException as e:
            self.logger.error(f"API request failed for {satellite} in North America: {e}")
            return None
        except Exception as e:
            self.logger.error(f"Error downloading {satellite} data for North America: {e}")
            return None
    
    def download_fire_data_via_file(self, satellite: str = 'VIIRS') -> Optional[str]:
        """
        Download fire data via direct file download (fallback method)
        
        Args:
            satellite: 'MODIS' or 'VIIRS'
            
        Returns:
            Path to downloaded file or None if failed
        """
        try:
            if satellite not in self.FILE_URLS:
                self.logger.error(f"Unsupported satellite: {satellite}")
                return None
            
            url = self.FILE_URLS[satellite]
            self.logger.debug(f"Downloading from: {url}")
            
            # Make request
            response = self.session.get(url, timeout=60)
            response.raise_for_status()
            
            # Check if we got actual data
            content = response.text.strip()
            if not content or len(content.split('\n')) <= 1:
                self.logger.debug(f"No {satellite} data available in file")
                return None
            
            # Save response to file
            filename = f"{satellite}_Global_24h_{datetime.now().strftime('%Y%m%d_%H%M')}.csv"
            file_path = self.download_dir / filename
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            # Verify file size and content
            file_size = file_path.stat().st_size
            if file_size == 0:
                self.logger.error(f"Downloaded file is empty: {filename}")
                file_path.unlink()
                return None
            
            # Count lines to verify we have actual data
            with open(file_path, 'r') as f:
                lines = f.readlines()
            
            if len(lines) <= 1:  # Only header or empty
                self.logger.debug(f"No fire detections in {filename}")
                file_path.unlink()
                return None
            
            # Check for new data to avoid duplicates
            data_hash = self._calculate_data_hash(content)
            if data_hash in self.processed_data_cache:
                self.logger.info(f"Data already processed, skipping: {filename}")
                file_path.unlink()
                return None
            
            # Add to processed cache
            self.processed_data_cache.add(data_hash)
            
            self.logger.info(f"Downloaded via file: {filename} ({file_size:,} bytes, {len(lines)-1} detections)")
            return str(file_path)
            
        except requests.exceptions.RequestException as e:
            self.logger.error(f"File download request failed for {satellite}: {e}")
            return None
        except Exception as e:
            self.logger.error(f"Error downloading {satellite} file: {e}")
            return None
    
    def download_fire_data_via_api_with_retry(self, target_date: date, satellite: str = 'VIIRS', 
                                            max_retries: int = 3) -> Optional[str]:
        """
        Download fire data via API with retry logic
        
        Args:
            target_date: Date to download data for
            satellite: 'MODIS' or 'VIIRS'
            max_retries: Maximum number of retry attempts
            
        Returns:
            Path to downloaded file or None if failed
        """
        for attempt in range(max_retries):
            try:
                file_path = self.download_fire_data_via_api(target_date, satellite)
                if file_path:
                    return file_path
                
                # If no data found, try previous day
                if attempt < max_retries - 1:
                    target_date = target_date - timedelta(days=1)
                    self.logger.debug(f"Retrying with previous day: {target_date}")
                
            except Exception as e:
                self.logger.error(f"Attempt {attempt + 1} failed: {e}")
                if attempt < max_retries - 1:
                    import time
                    time.sleep(2 ** attempt)  # Exponential backoff
        
        return None
    
    def find_latest_available_data(self, satellite: str = 'VIIRS', max_days_back: int = 3) -> Optional[Tuple[date, str]]:
        """
        Find the latest available fire data by checking recent dates
        
        Args:
            satellite: 'MODIS', 'VIIRS', or 'ALL'
            max_days_back: Maximum number of days to check back
            
        Returns:
            Tuple of (date, satellite) or None if no data found
        """
        satellites = ['VIIRS'] if satellite == 'ALL' else [satellite]
        
        for days_back in range(max_days_back):
            target_date = date.today() - timedelta(days=days_back)
            
            for sat in satellites:
                # Test if data is available by making a quick API call
                if self.test_data_availability(target_date, sat):
                    self.logger.info(f"Latest data found: {target_date} ({sat})")
                    return target_date, sat
        
        self.logger.warning(f"No fire data available in the last {max_days_back} days")
        return None
    
    def test_data_availability(self, target_date: date, satellite: str) -> bool:
        """
        Test if fire data is available for a specific date and satellite
        
        Args:
            target_date: Date to test
            satellite: 'MODIS' or 'VIIRS'
            
        Returns:
            True if data is available, False otherwise
        """
        try:
            params = {
                'country': 'USA',
                'satellite': satellite.lower(),
                'date': target_date.strftime('%Y-%m-%d'),
                'format': 'csv'
            }
            
            response = self.session.get(
                self.API_URLS[satellite],
                params=params,
                timeout=10
            )
            response.raise_for_status()
            
            # Check if we got actual data
            content = response.text.strip()
            return len(content) > 0 and len(content.split('\n')) > 1
            
        except Exception as e:
            self.logger.debug(f"Data availability test failed for {satellite} on {target_date}: {e}")
            return False
    
    def cleanup_downloads(self, file_paths: List[str]):
        """
        Clean up downloaded files
        
        Args:
            file_paths: List of file paths to clean up
        """
        for file_path in file_paths:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
                    self.logger.debug(f"Cleaned up: {file_path}")
            except Exception as e:
                self.logger.error(f"Error cleaning up {file_path}: {e}")
    
    def get_download_statistics(self) -> Dict:
        """
        Get statistics about downloaded files
        
        Returns:
            Dictionary with download statistics
        """
        try:
            files = list(self.download_dir.glob("*.csv"))
            total_size = sum(f.stat().st_size for f in files)
            
            return {
                "total_files": len(files),
                "total_size_bytes": total_size,
                "total_size_mb": round(total_size / (1024 * 1024), 2),
                "files": [f.name for f in files]
            }
        except Exception as e:
            self.logger.error(f"Error getting download statistics: {e}")
            return {"error": str(e)}
    
    def _calculate_data_hash(self, content: str) -> str:
        """
        Calculate a hash of the data content to detect duplicates
        
        Args:
            content: CSV content string
            
        Returns:
            Hash string for duplicate detection
        """
        import hashlib
        
        # Create hash of the content (excluding timestamps that might change)
        lines = content.strip().split('\n')
        if len(lines) <= 1:
            return hashlib.md5(content.encode()).hexdigest()
        
        # Hash only the data lines (skip header)
        data_lines = lines[1:] if len(lines) > 1 else []
        data_content = '\n'.join(data_lines)
        
        return hashlib.md5(data_content.encode()).hexdigest()
    
    def clear_processed_cache(self):
        """Clear the processed data cache (useful for testing or long-running processes)"""
        self.processed_data_cache.clear()
        self.logger.info("Cleared processed data cache")


if __name__ == "__main__":
    # Test the downloader
    import sys
    
    # Set up logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Create downloader
    downloader = NASAFireDownloader()
    
    # Test latest hourly data download
    print("Testing latest hourly fire data download...")
    files = downloader.download_latest_hourly_data('VIIRS')
    
    if files:
        print(f"✅ Downloaded {len(files)} files:")
        for file_path in files:
            print(f"   📄 {file_path}")
        
        # Show statistics
        stats = downloader.get_download_statistics()
        print(f"\n📊 Download Statistics:")
        print(f"   Total files: {stats.get('total_files', 0)}")
        print(f"   Total size: {stats.get('total_size_mb', 0)} MB")
    else:
        print("❌ No files downloaded")
    
    # Clean up test files
    if files:
        downloader.cleanup_downloads(files)
        print("🗑️ Cleaned up test files")