"""
Smart GEOS-CF File Downloader with Dynamic Day Folder Detection
Downloads the 24-hour forecast file from current time, automatically finding the latest available folder
"""

import os
import requests
from datetime import datetime, timedelta
from typing import Optional, Tuple


class SmartForecastDownloader:
    """
    OOP approach for downloading GEOS-CF forecast files with intelligent day folder detection
    """
    
    BASE_URL = "https://portal.nccs.nasa.gov/datashare/gmao/geos-cf/v1/forecast"
    
    def __init__(self, save_dir: str = "forecast/downloads", max_days_back: int = 5):
        """
        Initialize the smart downloader
        
        Args:
            save_dir: Directory to save downloaded files
            max_days_back: Maximum number of days to look back for available folders
        """
        self.save_dir = save_dir
        self.max_days_back = max_days_back
        os.makedirs(save_dir, exist_ok=True)
    
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
    
    def calculate_hour_offset(self, current_time: datetime, forecast_init_time: datetime) -> int:
        """
        Calculate the hour offset needed to get data for current_time from a forecast
        
        Args:
            current_time: The time we want data for
            forecast_init_time: When the forecast was initialized
            
        Returns:
            Hour offset (e.g., 24, 48, 72)
        """
        time_diff = current_time - forecast_init_time
        hours = int(time_diff.total_seconds() / 3600)
        return hours
    
    def generate_file_url(self, forecast_init_time: datetime, hour_offset: int) -> Tuple[str, str]:
        """
        Generate the URL and filename for a specific forecast file
        
        Args:
            forecast_init_time: When the forecast was initialized
            hour_offset: Hours from initialization (e.g., 24, 48)
            
        Returns:
            Tuple of (url, filename)
        """
        # Calculate target time
        target_time = forecast_init_time + timedelta(hours=hour_offset)
        
        # Format dates
        init_date_str = forecast_init_time.strftime("%Y%m%d")
        init_hour_str = forecast_init_time.strftime("%H")
        target_date_str = target_time.strftime("%Y%m%d")
        # GEOS-CF files are at :30 of each hour
        target_time_str = f"{target_time.strftime('%H')}30"
        
        # Construct filename
        filename = (
            f"GEOS-CF.v01.fcst.aqc_tavg_1hr_g1440x721_v1."
            f"{init_date_str}_{init_hour_str}z%2B{target_date_str}_{target_time_str}z.nc4"
        )
        
        # Construct directory path (based on initialization time)
        year = forecast_init_time.strftime("%Y")
        month = forecast_init_time.strftime("%m")
        day = forecast_init_time.strftime("%d")
        hour = forecast_init_time.strftime("%H")
        
        url = f"{self.BASE_URL}/Y{year}/M{month}/D{day}/H{hour}/{filename}"
        
        return url, filename.replace('%2B', '+')
    
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
    
    def find_latest_available_forecast(self, target_time: datetime) -> Optional[Tuple[datetime, int]]:
        """
        Find the latest available forecast that contains data for target_time
        Checks folders from most recent to older
        
        Args:
            target_time: The time we want data for (usually current time)
            
        Returns:
            Tuple of (forecast_init_time, hour_offset) or None if not found
        """
        print(f"\n🔍 Searching for latest available forecast for {target_time} UTC...")
        
        # Try different days back (0 = today, 1 = yesterday, etc.)
        for days_back in range(self.max_days_back + 1):
            # Try 12z first (more common), then 00z
            for use_12z in [True, False]:
                forecast_init_time = self.get_forecast_init_time(days_back, use_12z)
                hour_offset = self.calculate_hour_offset(target_time, forecast_init_time)
                
                # Skip if hour offset is negative or too far in the future
                if hour_offset < 0 or hour_offset > 120:  # GEOS-CF forecasts go up to 5 days
                    continue
                
                # Generate URL
                url, filename = self.generate_file_url(forecast_init_time, hour_offset)
                
                print(f"  Checking: D{forecast_init_time.day:02d} ({forecast_init_time.strftime('%Y-%m-%d')} "
                      f"{forecast_init_time.strftime('%Hz')}) + {hour_offset}h...")
                
                # Check if URL exists
                if self.check_url_exists(url):
                    print(f"  ✅ Found! Using forecast from {forecast_init_time} + {hour_offset}h")
                    return forecast_init_time, hour_offset
                else:
                    print(f"  ❌ Not available")
                    print(f"  ❌ URL: {url}")
        
        print(f"  ⚠️ No available forecast found within {self.max_days_back} days")
        return None
    
    def download_file(self, url: str, filename: str) -> bool:
        """
        Download a file from URL
        
        Args:
            url: URL to download from
            filename: Local filename to save as
            
        Returns:
            True if successful, False otherwise
        """
        save_path = os.path.join(self.save_dir, filename)
        
        # Skip if already exists
        if os.path.exists(save_path):
            print(f"✅ File already exists: {filename}")
            return True
        
        try:
            print(f"\n📥 Downloading: {filename}")
            print(f"   From: {url}")
            
            response = requests.get(url, stream=True, timeout=300)
            response.raise_for_status()
            
            total_size = int(response.headers.get('content-length', 0))
            downloaded_size = 0
            
            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
                    downloaded_size += len(chunk)
                    
                    if total_size > 0:
                        progress = (downloaded_size / total_size) * 100
                        print(f"\r   Progress: {progress:.1f}% ({downloaded_size / 1024 / 1024:.1f} MB)", end='')
            
            print(f"\n✅ Download complete: {save_path}")
            return True
            
        except requests.exceptions.RequestException as e:
            print(f"\n❌ Download failed: {e}")
            return False
    
    def download_24h_forecast(self, target_time: Optional[datetime] = None) -> Optional[str]:
        """
        Download the 24-hour forecast file for a specific time (or 24h ahead of current time)
        Automatically finds the latest available forecast folder
        
        Args:
            target_time: Time to get forecast for (defaults to current UTC time + 24 hours)
            
        Returns:
            Path to downloaded file, or None if failed
        """
        if target_time is None:
            # For forecast, we want data 24 hours ahead of current time
            target_time = self.get_current_utc_time() + timedelta(hours=24)
        
        print(f"\n{'='*70}")
        print(f"🌍 SMART FORECAST DOWNLOADER - 24h Forecast Mode")
        print(f"{'='*70}")
        print(f"Target time: {target_time} UTC")
        
        # Find latest available forecast
        result = self.find_latest_available_forecast(target_time)
        
        if result is None:
            print("\n❌ Failed: No available forecast found")
            return None
        
        forecast_init_time, hour_offset = result
        
        # Generate URL and download
        url, filename = self.generate_file_url(forecast_init_time, hour_offset)
        
        print(f"\n📋 Download Details:")
        print(f"   Forecast Init: {forecast_init_time} UTC")
        print(f"   Hour Offset: +{hour_offset}h")
        print(f"   Target Time: {forecast_init_time + timedelta(hours=hour_offset)} UTC")
        
        if self.download_file(url, filename):
            save_path = os.path.join(self.save_dir, filename)
            print(f"\n{'='*70}")
            print(f"✅ SUCCESS: File ready at {save_path}")
            print(f"{'='*70}")
            return save_path
        else:
            return None


def main():
    """Example usage"""
    downloader = SmartForecastDownloader(save_dir="./downloads", max_days_back=5)
    
    # Download 24h forecast for current time
    file_path = downloader.download_24h_forecast()
    
    if file_path:
        print(f"\n✅ Ready for processing: {file_path}")
    else:
        print(f"\n❌ Download failed")


if __name__ == "__main__":
    main()

