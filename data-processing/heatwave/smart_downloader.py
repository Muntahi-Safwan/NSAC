"""
Smart GEOS-CF Meteorological Data Downloader
Downloads 24-hour batches of hourly meteorological forecast data for heatwave prediction
"""

import os
import requests
import time
from datetime import datetime, timedelta
from typing import Optional, List, Tuple
from pathlib import Path
import concurrent.futures
import threading


class MeteorologicalDataDownloader:
    """
    Smart downloader for GEOS-CF meteorological forecast data
    Downloads 24-hour batches of hourly data for comprehensive heatwave analysis
    """
    
    BASE_URL = "https://portal.nccs.nasa.gov/datashare/gmao/geos-cf/v1/forecast"
    
    def __init__(self, save_dir: str = "heatwave/downloads", max_days_back: int = 5, max_parallel: int = 3):
        """
        Initialize the meteorological data downloader
        
        Args:
            save_dir: Directory to save downloaded files
            max_days_back: Maximum number of days to look back for available folders
            max_parallel: Maximum number of parallel downloads (default: 3, be nice to NASA servers)
        """
        self.save_dir = Path(save_dir)
        self.save_dir.mkdir(parents=True, exist_ok=True)
        self.max_days_back = max_days_back
        self.max_parallel = max_parallel
        self.download_lock = threading.Lock()
    
    def get_current_utc_time(self) -> datetime:
        """Get current UTC time"""
        return datetime.utcnow()
    
    def get_forecast_init_time(self, days_back: int, use_12z: bool = True) -> datetime:
        """
        Get forecast initialization time for a specific day
        
        Args:
            days_back: Number of days back from today
            use_12z: If True, use 12z forecast; otherwise use 00z
            
        Returns:
            datetime object for the forecast initialization time
        """
        target_date = self.get_current_utc_time() - timedelta(days=days_back)
        init_hour = 12 if use_12z else 0
        return target_date.replace(hour=init_hour, minute=0, second=0, microsecond=0)
    
    def generate_hourly_file_urls(self, forecast_init_time: datetime, target_date: datetime) -> List[Tuple[str, str, int]]:
        """
        Generate URLs for 24 hourly files for a specific target date
        
        Args:
            forecast_init_time: When the forecast was initialized
            target_date: The date we want 24 hours of data for
            
        Returns:
            List of (url, filename, hour_offset) tuples for 24 hours
        """
        urls = []
        
        # Calculate base hour offset to reach target_date 00:00 UTC
        target_datetime = datetime.combine(target_date, datetime.min.time())  # Convert date to datetime at 00:00
        base_offset = int((target_datetime - forecast_init_time).total_seconds() / 3600)
        
        for hour in range(24):  # 0 to 23 hours
            hour_offset = base_offset + hour
            
            # Skip if offset is negative or too far in future
            if hour_offset < 0 or hour_offset > 120:  # GEOS-CF goes up to 5 days
                continue
            
            # Target time for this hour
            target_time = forecast_init_time + timedelta(hours=hour_offset)
            
            # Generate URL components
            year = forecast_init_time.year
            month = forecast_init_time.month
            day = forecast_init_time.day
            init_hour = forecast_init_time.hour
            
            # URL path
            url_path = f"Y{year}/M{month:02d}/D{day:02d}/H{init_hour:02d}"
            
            # Filename components
            init_str = f"{forecast_init_time.strftime('%Y%m%d')}_{init_hour:02d}z"
            # NASA GEOS-CF target times are always :30 minutes past the hour
            # For hour_offset=0 → 12:30z, hour_offset=1 → 13:30z, etc.
            target_time_30min = forecast_init_time + timedelta(hours=hour_offset, minutes=30)
            target_str = f"{target_time_30min.strftime('%Y%m%d')}_{target_time_30min.strftime('%H%M')}z"
            
            filename = f"GEOS-CF.v01.fcst.met_tavg_1hr_g1440x721_x1.{init_str}+{target_str}.nc4"
            url = f"{self.BASE_URL}/{url_path}/{filename.replace('+', '%2B')}"
            
            urls.append((url, filename, hour_offset))
        
        return urls
    
    def check_url_exists(self, url: str, timeout: int = 10) -> bool:
        """
        Check if a URL exists (HEAD request)
        
        Args:
            url: URL to check
            timeout: Request timeout in seconds
            
        Returns:
            True if URL exists, False otherwise
        """
        try:
            response = requests.head(url, timeout=timeout, allow_redirects=True)
            return response.status_code == 200
        except requests.exceptions.RequestException:
            return False
    
    def download_single_file(self, url: str, filename: str, max_retries: int = 3) -> bool:
        """
        Download a single meteorological file with optimizations
        
        Args:
            url: URL to download from
            filename: Local filename to save as
            max_retries: Maximum number of retry attempts
            
        Returns:
            True if successful, False otherwise
        """
        save_path = self.save_dir / filename
        
        # Skip if already exists and is valid
        if save_path.exists():
            file_size = save_path.stat().st_size
            if file_size > 1024 * 1024:  # At least 1MB
                # Quick NetCDF validation
                if self.validate_netcdf_file(save_path):
                    print(f"✅ File already exists and valid: {filename} ({file_size / 1024 / 1024:.1f} MB)")
                    return True
                else:
                    print(f"🔧 Removing corrupted file: {filename}")
                    save_path.unlink()
            else:
                print(f"⚠️ Removing incomplete file: {filename}")
                save_path.unlink()
        
        # Optimized session with better settings
        session = requests.Session()
        session.headers.update({
            'User-Agent': 'NSAC-HeatwaveSystem/1.0',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive'
        })
        
        for attempt in range(max_retries):
            try:
                if attempt > 0:
                    print(f"🔄 Retry {attempt}/{max_retries-1}: {filename}")
                else:
                    print(f"📥 Downloading: {filename}")
                
                # Optimized request with better timeout and chunk size
                response = session.get(
                    url, 
                    stream=True, 
                    timeout=(30, 300),  # (connect_timeout, read_timeout)
                    headers={'Accept': 'application/octet-stream'}
                )
                response.raise_for_status()
                
                total_size = int(response.headers.get('content-length', 0))
                downloaded_size = 0
                start_time = time.time()
                
                with open(save_path, 'wb') as f:
                    # Larger chunk size for better performance
                    for chunk in response.iter_content(chunk_size=64*1024):  # 64KB chunks
                        if chunk:  # Filter out keep-alive chunks
                            f.write(chunk)
                            downloaded_size += len(chunk)
                            
                            # Show progress every 2MB or 10% intervals
                            if total_size > 0 and (downloaded_size % (2*1024*1024) == 0 or downloaded_size == total_size):
                                progress = (downloaded_size / total_size) * 100
                                elapsed = time.time() - start_time
                                speed = downloaded_size / elapsed / 1024 / 1024 if elapsed > 0 else 0
                                print(f"\r   Progress: {progress:.1f}% ({downloaded_size / 1024 / 1024:.1f} MB) - {speed:.1f} MB/s", end='')
                
                elapsed = time.time() - start_time
                avg_speed = downloaded_size / elapsed / 1024 / 1024 if elapsed > 0 else 0
                
                # Validate the downloaded NetCDF file
                if self.validate_netcdf_file(save_path):
                    print(f"\n✅ Download complete and validated: {filename} ({avg_speed:.1f} MB/s avg)")
                    return True
                else:
                    print(f"\n❌ Downloaded file is corrupted: {filename}")
                    save_path.unlink()
                    if attempt < max_retries - 1:
                        print(f"🔄 Will retry due to corruption...")
                        continue
                    return False
                
            except requests.exceptions.Timeout as e:
                print(f"\n⏱️ Timeout on attempt {attempt + 1}: {e}")
                if attempt == max_retries - 1:
                    print(f"❌ Max retries reached for {filename}")
            except requests.exceptions.RequestException as e:
                print(f"\n❌ Download error on attempt {attempt + 1}: {e}")
                if attempt == max_retries - 1:
                    print(f"❌ Max retries reached for {filename}")
            finally:
                # Clean up partial file on failure
                if save_path.exists() and (not save_path.stat().st_size or save_path.stat().st_size < 1024*1024):
                    save_path.unlink()
        
        return False
    
    def validate_netcdf_file(self, file_path: Path) -> bool:
        """
        Validate that a NetCDF file is not corrupted
        
        Args:
            file_path: Path to the NetCDF file
            
        Returns:
            True if file is valid, False if corrupted
        """
        try:
            import netCDF4
            # Try to open and read basic info from the file
            with netCDF4.Dataset(file_path, 'r') as nc:
                # Check if file has expected dimensions
                if 'lat' in nc.dimensions and 'lon' in nc.dimensions:
                    return True
                return False
        except Exception:
            # Any exception means the file is corrupted
            return False
    
    def download_files_parallel(self, urls_and_filenames: List[Tuple[str, str]]) -> List[str]:
        """
        Download multiple files in parallel for better performance
        
        Args:
            urls_and_filenames: List of (url, filename) tuples
            
        Returns:
            List of successfully downloaded file paths
        """
        if not urls_and_filenames:
            return []
        
        print(f"🚀 Starting parallel downloads ({self.max_parallel} concurrent)")
        successful_downloads = []
        
        def download_wrapper(url_filename):
            url, filename = url_filename
            if self.download_single_file(url, filename):
                return str(self.save_dir / filename)
            return None
        
        # Use ThreadPoolExecutor for parallel downloads
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.max_parallel) as executor:
            # Submit all download tasks
            future_to_filename = {
                executor.submit(download_wrapper, url_filename): url_filename[1] 
                for url_filename in urls_and_filenames
            }
            
            # Collect results as they complete
            for future in concurrent.futures.as_completed(future_to_filename):
                filename = future_to_filename[future]
                try:
                    result = future.result()
                    if result:
                        successful_downloads.append(result)
                except Exception as e:
                    print(f"❌ Parallel download failed for {filename}: {e}")
        
        print(f"📊 Parallel download summary: {len(successful_downloads)}/{len(urls_and_filenames)} successful")
        return successful_downloads
    
    def download_24h_batch(self, target_date: Optional[datetime] = None) -> Optional[List[str]]:
        """
        Download 24 hours of meteorological data for a specific date
        
        Args:
            target_date: Date to get 24 hours of data for (defaults to tomorrow)
            
        Returns:
            List of downloaded file paths, or None if failed
        """
        if target_date is None:
            # Default to tomorrow (24 hours ahead for heatwave prediction)
            target_date = self.get_current_utc_time() + timedelta(days=1)
        
        print(f"\n{'='*70}")
        print(f"🌡️ METEOROLOGICAL DATA DOWNLOADER - 24h Batch Mode")
        print(f"{'='*70}")
        print(f"Target date: {target_date.strftime('%Y-%m-%d')} UTC")
        
        # Find latest available forecast
        forecast_init_time = None
        hourly_urls = []
        
        for days_back in range(self.max_days_back + 1):
            for use_12z in [True, False]:  # Try 12z first, then 00z
                test_init_time = self.get_forecast_init_time(days_back, use_12z)
                test_urls = self.generate_hourly_file_urls(test_init_time, target_date)
                
                if not test_urls:
                    continue
                
                # Check if first URL exists (sample check)
                first_url, _, _ = test_urls[0]
                print(f"🔍 Checking forecast: {test_init_time.strftime('%Y-%m-%d %Hz')} UTC...")
                
                if self.check_url_exists(first_url):
                    print(f"✅ Found available forecast: {test_init_time.strftime('%Y-%m-%d %Hz')} UTC")
                    forecast_init_time = test_init_time
                    hourly_urls = test_urls
                    break
                else:
                    print(f"❌ Not available: {test_init_time.strftime('%Y-%m-%d %Hz')} UTC")
            
            if forecast_init_time:
                break
        
        if not forecast_init_time:
            print(f"\n❌ No available meteorological forecast found within {self.max_days_back} days")
            return None
        
        print(f"\n📋 Download Plan:")
        print(f"   Forecast Init: {forecast_init_time.strftime('%Y-%m-%d %H:%M')} UTC")
        print(f"   Target Date: {target_date.strftime('%Y-%m-%d')} UTC")
        print(f"   Files to download: {len(hourly_urls)}")
        
        # Download files (can be parallelized for speed)
        downloaded_files = []
        successful_downloads = 0
        
        print(f"\n🚀 Starting batch download...")
        
        # Sequential download (can be made parallel if needed)
        for i, (url, filename, hour_offset) in enumerate(hourly_urls):
            print(f"\n[{i+1}/{len(hourly_urls)}] Hour {hour_offset:+03d}:")
            
            if self.download_single_file(url, filename):
                downloaded_files.append(str(self.save_dir / filename))
                successful_downloads += 1
            else:
                print(f"⚠️ Failed to download hour {hour_offset}")
        
        print(f"\n{'='*70}")
        if successful_downloads == len(hourly_urls):
            print(f"✅ BATCH DOWNLOAD COMPLETE")
            print(f"   Downloaded: {successful_downloads}/{len(hourly_urls)} files")
            print(f"   Target date: {target_date.strftime('%Y-%m-%d')} UTC")
            print(f"{'='*70}")
            return downloaded_files
        else:
            print(f"⚠️ PARTIAL DOWNLOAD")
            print(f"   Downloaded: {successful_downloads}/{len(hourly_urls)} files")
            print(f"   Some files may be missing")
            print(f"{'='*70}")
            return downloaded_files if downloaded_files else None


def main():
    """Example usage"""
    downloader = MeteorologicalDataDownloader()
    
    # Download 24 hours of meteorological data for tomorrow
    tomorrow = datetime.utcnow() + timedelta(days=1)
    files = downloader.download_24h_batch(tomorrow)
    
    if files:
        print(f"\n✅ Ready for processing: {len(files)} files downloaded")
        for file_path in files[:3]:  # Show first 3 files
            print(f"   - {os.path.basename(file_path)}")
        if len(files) > 3:
            print(f"   ... and {len(files) - 3} more files")
    else:
        print(f"\n❌ Download failed")


if __name__ == "__main__":
    main()
