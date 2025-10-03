"""
Hourly TEMPO Data Downloader

Downloads only the latest hour of TEMPO data for efficient real-time processing.
"""

import os
import sys
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from pathlib import Path

# Add parent directories to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

try:
    import earthaccess
    EARTHACCESS_AVAILABLE = True
except ImportError:
    EARTHACCESS_AVAILABLE = False

class HourlyTempoDownloader:
    """
    TEMPO data downloader that focuses on getting the latest hour of data efficiently.
    """
    
    def __init__(self, download_dir: str = "downloads"):
        """
        Initialize hourly TEMPO downloader.
        
        Args:
            download_dir: Directory to store downloaded files
        """
        if not EARTHACCESS_AVAILABLE:
            raise ImportError("earthaccess library not available. Install with: pip install earthaccess")
        
        self.download_dir = Path(download_dir)
        self.download_dir.mkdir(parents=True, exist_ok=True)
        
        # Setup logging
        logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
        self.logger = logging.getLogger(__name__)
        
        # Authenticate with Earthdata
        self._authenticate()
    
    def _authenticate(self):
        """Authenticate with Earthdata using earthaccess."""
        try:
            earthaccess.login()
            self.logger.info("✓ Authenticated with Earthdata")
        except Exception as e:
            self.logger.warning(f"Authentication failed: {e}")
            self.logger.info("You may need to run: earthaccess login")
    
    def find_latest_hourly_data(self, product: str = "no2", hours_back: int = 24) -> Optional[Dict]:
        """
        Find the latest hourly TEMPO data for a product.
        
        Args:
            product: Data product type (no2, o3)
            hours_back: Maximum hours to look back
            
        Returns:
            Latest hourly file metadata or None if not found
        """
        # Product configurations
        products = {
            "no2": "TEMPO_NO2_L2",
            "o3": "TEMPO_O3TOT_L2"
        }
        
        if product not in products:
            raise ValueError(f"Unknown product: {product}. Available: {list(products.keys())}")
        
        short_name = products[product]
        
        self.logger.info(f"Searching for latest hourly {product.upper()} data...")
        
        # Start from current hour and go back hour by hour
        now = datetime.now()
        
        for hour_offset in range(hours_back):
            search_time = now - timedelta(hours=hour_offset)
            date_str = search_time.strftime("%Y-%m-%d")
            hour_str = search_time.strftime("%H")
            
            self.logger.info(f"  Checking {date_str} hour {hour_str} (hour {hour_offset + 1}/{hours_back})...")
            
            try:
                # Search for data in this specific hour
                start_time = search_time.replace(minute=0, second=0, microsecond=0)
                end_time = start_time + timedelta(hours=1)
                
                results = earthaccess.search_data(
                    short_name=short_name,
                    temporal=(
                        start_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                        end_time.strftime("%Y-%m-%dT%H:%M:%SZ")
                    ),
                    count=1  # Only need the first result
                )
                
                if results:
                    result = results[0]
                    
                    # Extract file information
                    file_size = 0
                    try:
                        # Try different ways to get file size
                        if hasattr(result, 'size'):
                            size_attr = result.size
                            if callable(size_attr):
                                file_size = size_attr()
                            else:
                                file_size = size_attr
                        
                        # Convert to int if possible
                        if file_size is not None:
                            file_size = int(file_size)
                        else:
                            file_size = 0
                    except (ValueError, TypeError, AttributeError):
                        file_size = 0
                    
                    file_info = {
                        "product": product,
                        "short_name": short_name,
                        "date": date_str,
                        "hour": hour_str,
                        "datetime": search_time,
                        "size": file_size,
                        "size_mb": file_size / (1024 * 1024) if file_size > 0 else 0,
                        "raw_result": result,
                        "granule_id": result.meta.get("concept-id", "") if hasattr(result, 'meta') else ""
                    }
                    
                    self.logger.info(f"  ✓ Found {product.upper()} data for {date_str} hour {hour_str}")
                    self.logger.info(f"    File size: {file_info['size_mb']:.2f} MB")
                    self.logger.info(f"    Granule ID: {file_info['granule_id']}")
                    
                    return file_info
                else:
                    self.logger.info(f"    No {product.upper()} data found for hour {hour_str}")
                    
            except Exception as e:
                self.logger.warning(f"    Error searching hour {hour_str}: {e}")
                continue
        
        self.logger.warning(f"No {product.upper()} data found in the last {hours_back} hours")
        return None
    
    def download_hourly_file(self, file_info: Dict) -> Optional[str]:
        """
        Download the hourly TEMPO file.
        
        Args:
            file_info: File metadata from find_latest_hourly_data
            
        Returns:
            Path to downloaded file or None if failed
        """
        try:
            product = file_info["product"]
            raw_result = file_info["raw_result"]
            
            self.logger.info(f"Downloading hourly {product.upper()} file...")
            self.logger.info(f"  Date: {file_info['date']} hour {file_info['hour']}")
            self.logger.info(f"  Size: {file_info['size_mb']:.2f} MB")
            
            # Create product directory
            product_dir = self.download_dir / product
            product_dir.mkdir(exist_ok=True)
            
            # Download the file
            self.logger.info(f"  Starting download to: {product_dir}")
            
            files = earthaccess.download(
                [raw_result], 
                str(product_dir)
            )
            
            if files and len(files) > 0:
                downloaded_file = files[0]
                
                # Verify download
                if os.path.exists(downloaded_file):
                    actual_size = os.path.getsize(downloaded_file)
                    actual_size_mb = actual_size / (1024 * 1024)
                    
                    self.logger.info(f"✓ Download completed successfully!")
                    self.logger.info(f"  File: {os.path.basename(downloaded_file)}")
                    self.logger.info(f"  Actual size: {actual_size_mb:.2f} MB ({actual_size:,} bytes)")
                    
                    return downloaded_file
                else:
                    self.logger.error("Downloaded file not found")
                    return None
            else:
                self.logger.error("No files downloaded")
                return None
                
        except Exception as e:
            self.logger.error(f"Error downloading file: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def get_latest_hourly_data(self, products: List[str] = None) -> Dict:
        """
        Get the latest hourly TEMPO data for specified products.
        
        Args:
            products: List of products to download (default: ['no2', 'o3'])
            
        Returns:
            Dictionary with results for each product
        """
        if products is None:
            products = ['no2', 'o3']
        
        results = {}
        
        for product in products:
            self.logger.info(f"\n{'='*60}")
            self.logger.info(f"Processing hourly {product.upper()} data")
            self.logger.info(f"{'='*60}")
            
            # Find latest hourly data
            file_info = self.find_latest_hourly_data(product)
            
            if file_info:
                # Download the file
                downloaded_file = self.download_hourly_file(file_info)
                
                results[product] = {
                    'success': downloaded_file is not None,
                    'file_path': downloaded_file,
                    'date': file_info['date'],
                    'hour': file_info['hour'],
                    'datetime': file_info['datetime'],
                    'size_mb': file_info['size_mb'],
                    'granule_id': file_info['granule_id']
                }
            else:
                results[product] = {
                    'success': False,
                    'file_path': None,
                    'date': None,
                    'hour': None,
                    'datetime': None,
                    'size_mb': 0,
                    'granule_id': None
                }
        
        return results

def test_hourly_downloader():
    """Test the hourly TEMPO downloader."""
    print("TESTING HOURLY TEMPO DOWNLOADER")
    print("=" * 60)
    
    try:
        # Initialize downloader
        downloader = HourlyTempoDownloader()
        print("✓ HourlyTempoDownloader initialized")
        
        # Test finding latest hourly NO2 data
        print(f"\n1. Finding latest hourly NO2 data...")
        no2_info = downloader.find_latest_hourly_data("no2", hours_back=12)
        
        if no2_info:
            print(f"✓ Found latest hourly NO2 data:")
            print(f"  Date: {no2_info['date']} hour {no2_info['hour']}")
            print(f"  Size: {no2_info['size_mb']:.2f} MB")
            print(f"  Granule ID: {no2_info['granule_id']}")
            
            # Test download
            print(f"\n2. Testing download...")
            downloaded_file = downloader.download_hourly_file(no2_info)
            
            if downloaded_file:
                print(f"✓ Download successful: {os.path.basename(downloaded_file)}")
            else:
                print(f"✗ Download failed")
        else:
            print("⚠ No hourly NO2 data found")
        
        # Test complete pipeline
        print(f"\n3. Testing complete hourly pipeline...")
        results = downloader.get_latest_hourly_data(['no2'])
        
        print(f"\nResults:")
        for product, result in results.items():
            print(f"  {product.upper()}: {'✓ Success' if result['success'] else '✗ Failed'}")
            if result['success']:
                print(f"    File: {os.path.basename(result['file_path']) if result['file_path'] else 'None'}")
                print(f"    Date: {result['date']} hour {result['hour']}")
                print(f"    Size: {result['size_mb']:.2f} MB")
        
        print(f"\n✓ Hourly downloader test completed")
        return True
        
    except Exception as e:
        print(f"✗ Hourly downloader test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_hourly_downloader()
