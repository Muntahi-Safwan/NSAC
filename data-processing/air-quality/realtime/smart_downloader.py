"""
Smart GEOS-CF Analysis Data Downloader
Downloads the latest analysis data from GEOS-CF with correct URL structure
Based on: https://portal.nccs.nasa.gov/datashare/gmao/geos-cf/v1/ana/Y2025/M09/D30/GEOS-CF.v01.rpl.aqc_tavg_1hr_g1440x721_v1.20250930_1130z.nc4
"""

import os
import requests
from datetime import datetime, timedelta
from typing import Optional, Tuple
from pathlib import Path


class GeosCfAnalysisSmartDownloader:
    """
    Smart downloader for GEOS-CF analysis data with dynamic folder detection
    """
    
    BASE_URL = "https://portal.nccs.nasa.gov/datashare/gmao/geos-cf/v1/ana"
    
    def __init__(self, save_dir: str = "realtime/downloads", max_days_back: int = 3):
        """
        Initialize the smart analysis downloader
        
        Args:
            save_dir: Directory to save downloaded files
            max_days_back: Maximum number of days to look back for available folders
        """
        self.save_dir = Path(save_dir)
        self.save_dir.mkdir(parents=True, exist_ok=True)
        self.max_days_back = max_days_back
    
    def get_current_utc_time(self) -> datetime:
        """Get current UTC time"""
        return datetime.utcnow()
    
    def get_analysis_time(self, days_back: int, hours_back: int = 0) -> datetime:
        """
        Get analysis time for a specific day and hour
        
        Args:
            days_back: Number of days back from today
            hours_back: Number of hours back from the day start
            
        Returns:
            datetime object for the analysis time
        """
        target_date = self.get_current_utc_time() - timedelta(days=days_back)
        # Round down to nearest hour
        analysis_time = target_date.replace(minute=0, second=0, microsecond=0)
        return analysis_time - timedelta(hours=hours_back)
    
    def generate_file_url(self, analysis_time: datetime) -> Tuple[str, str]:
        """
        Generate the URL and filename for analysis data
        
        Args:
            analysis_time: Time for the analysis data
            
        Returns:
            Tuple of (url, filename)
        """
        # Format dates for GEOS-CF analysis URL structure
        year = analysis_time.strftime("%Y")
        month = analysis_time.strftime("%m")
        day = analysis_time.strftime("%d")
        
        # Analysis files are typically at :30 of each hour
        analysis_time_str = analysis_time.strftime("%Y%m%d_%H30z")
        
        # Generate filename for air quality analysis (rpl = replay/analysis)
        filename = f"GEOS-CF.v01.rpl.aqc_tavg_1hr_g1440x721_v1.{analysis_time_str}.nc4"
        
        # Construct URL path: /ana/Y2025/M09/D30/filename
        url = f"{self.BASE_URL}/Y{year}/M{month}/D{day}/{filename}"
        
        return url, filename
    
    def check_url_exists(self, url: str) -> bool:
        """
        Check if a URL exists by making a HEAD request
        
        Args:
            url: URL to check
            
        Returns:
            True if URL exists, False otherwise
        """
        try:
            response = requests.head(url, timeout=10)
            return response.status_code == 200
        except requests.RequestException:
            return False
    
    def find_latest_available_analysis(self, target_time: Optional[datetime] = None) -> Optional[Tuple[datetime, str, str]]:
        """
        Find the latest available analysis data
        
        Args:
            target_time: Target time to find analysis for (defaults to current time)
            
        Returns:
            Tuple of (analysis_time, url, filename) or None if not found
        """
        if target_time is None:
            target_time = self.get_current_utc_time()
        
        print(f"\n🔍 Searching for latest available GEOS-CF analysis data...")
        print(f"Target time: {target_time} UTC")
        
        # Try different days back and hours back
        for days_back in range(self.max_days_back + 1):
            for hours_back in [0, 6, 12, 18]:  # Check every 6 hours
                analysis_time = self.get_analysis_time(days_back, hours_back)
                
                # Skip if analysis time is in the future
                if analysis_time > target_time:
                    continue
                
                url, filename = self.generate_file_url(analysis_time)
                
                age_hours = (target_time - analysis_time).total_seconds() / 3600
                print(f"  Checking: {analysis_time.strftime('%Y-%m-%d %H:%M')} UTC ({age_hours:.1f}h old)...")
                
                if self.check_url_exists(url):
                    print(f"  ✅ Found! Using analysis from {analysis_time}")
                    return analysis_time, url, filename
                else:
                    print(f"  ❌ Not available")
        
        print(f"  ⚠️ No available analysis found within {self.max_days_back} days")
        return None
    
    def download_file(self, url: str, filename: str) -> bool:
        """
        Download a file from the given URL
        
        Args:
            url: URL to download from
            filename: Local filename to save as
            
        Returns:
            True if download successful, False otherwise
        """
        try:
            print(f"\n📥 Downloading analysis file...")
            print(f"   URL: {url}")
            print(f"   File: {filename}")
            
            response = requests.get(url, stream=True, timeout=300)
            response.raise_for_status()
            
            save_path = self.save_dir / filename
            
            # Download with progress
            total_size = int(response.headers.get('content-length', 0))
            downloaded_size = 0
            
            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        downloaded_size += len(chunk)
                        
                        if total_size > 0:
                            progress = (downloaded_size / total_size) * 100
                            print(f"\r   Progress: {progress:.1f}% ({downloaded_size / 1024 / 1024:.1f} MB / {total_size / 1024 / 1024:.1f} MB)", end='', flush=True)
            
            print(f"\n   ✅ Download complete: {save_path}")
            return True
            
        except requests.RequestException as e:
            print(f"\n   ❌ Download failed: {e}")
            return False
        except Exception as e:
            print(f"\n   ❌ Unexpected error: {e}")
            return False
    
    def download_latest_analysis(self, target_time: Optional[datetime] = None) -> Optional[str]:
        """
        Download the latest available analysis data
        
        Args:
            target_time: Target time to find analysis for (defaults to current time)
            
        Returns:
            Path to downloaded file or None if failed
        """
        print(f"\n🚀 Starting GEOS-CF Analysis Download")
        
        # Find latest available analysis
        result = self.find_latest_available_analysis(target_time)
        
        if result is None:
            print("\n❌ Failed: No available analysis data found")
            return None
        
        analysis_time, url, filename = result
        
        print(f"\n📋 Download Details:")
        print(f"   Analysis Time: {analysis_time} UTC")
        print(f"   Age: {(self.get_current_utc_time() - analysis_time).total_seconds() / 3600:.1f} hours")
        
        if self.download_file(url, filename):
            return str(self.save_dir / filename)
        else:
            return None


def main():
    """Test the GEOS-CF Analysis Smart Downloader"""
    print("🧪 Testing GEOS-CF Analysis Smart Downloader")
    
    downloader = GeosCfAnalysisSmartDownloader()
    
    # Download latest analysis data
    file_path = downloader.download_latest_analysis()
    
    if file_path:
        print(f"\n✅ Success! Downloaded: {file_path}")
    else:
        print(f"\n❌ Failed to download analysis data")


if __name__ == "__main__":
    main()

