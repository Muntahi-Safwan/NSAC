"""
TEMPO Data Downloader

Downloads the latest TEMPO satellite data for real-time air quality monitoring.
This is the main, production-ready downloader.
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

class TempoDownloader:
    """
    Main TEMPO data downloader for real-time air quality monitoring.
    
    Downloads the latest available TEMPO satellite data (NO2 and O3) and stores
    it in the appropriate directory structure.
    """
    
    def __init__(self, download_dir: str = "downloads"):
        """
        Initialize TEMPO downloader.
        
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
        
        # Product configurations - Correct product names
        self.products = {
            "no2": {
                "short_name": "TEMPO_NO2_L2",
                "description": "TEMPO Level 2 Nitrogen Dioxide",
                "variables": ["NO2_TroposphericVerticalColumn"]
            },
            "o3": {
                "short_name": "TEMPO_O3PROF_L2", 
                "description": "TEMPO Level 2 Ozone Profile",
                "variables": ["O3Profile"]
            }
        }
        
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
    
    def find_latest_data(self, product: str = "no2", days_back: int = 7) -> Optional[Dict]:
        """
        Find the latest available TEMPO data for a product.
        
        Args:
            product: Data product type (no2, o3)
            days_back: Maximum days to look back
            
        Returns:
            Latest file metadata or None if not found
        """
        if product not in self.products:
            raise ValueError(f"Unknown product: {product}. Available: {list(self.products.keys())}")
        
        short_name = self.products[product]["short_name"]
        
        self.logger.info(f"Searching for latest {product.upper()} data...")
        
        # Start from today and go back day by day
        today = datetime.now()
        
        for day_offset in range(days_back):
            search_date = today - timedelta(days=day_offset)
            date_str = search_date.strftime("%Y-%m-%d")
            
            self.logger.info(f"  Checking {date_str} (day {day_offset + 1}/{days_back})...")
            
            try:
                # Search for data on this specific day
                results = earthaccess.search_data(
                    short_name=short_name,
                    temporal=(date_str, date_str),
                    count=1  # Only need the first result
                )
                
                if results:
                    result = results[0]
                    
                    # Extract file information
                    file_size = 0
                    try:
                        if hasattr(result, 'size'):
                            size_attr = result.size
                            if callable(size_attr):
                                file_size = size_attr()
                            else:
                                file_size = size_attr
                        
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
                        "size": file_size,
                        "size_mb": file_size / (1024 * 1024) if file_size > 0 else 0,
                        "raw_result": result,
                        "granule_id": result.meta.get("concept-id", "") if hasattr(result, 'meta') else ""
                    }
                    
                    self.logger.info(f"  ✓ Found {product.upper()} data on {date_str}")
                    self.logger.info(f"    File size: {file_info['size_mb']:.2f} MB")
                    self.logger.info(f"    Granule ID: {file_info['granule_id']}")
                    
                    return file_info
                else:
                    self.logger.info(f"    No {product.upper()} data found on {date_str}")
                    
            except Exception as e:
                self.logger.warning(f"    Error searching {date_str}: {e}")
                continue
        
        self.logger.warning(f"No {product.upper()} data found in the last {days_back} days")
        return None
    
    def download_file(self, file_info: Dict) -> Optional[str]:
        """
        Download a TEMPO file.
        
        Args:
            file_info: File metadata from find_latest_data
            
        Returns:
            Path to downloaded file or None if failed
        """
        try:
            product = file_info["product"]
            raw_result = file_info["raw_result"]
            
            self.logger.info(f"Downloading {product.upper()} file...")
            self.logger.info(f"  Date: {file_info['date']}")
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
    
    def download_latest_data(self, products: List[str] = None) -> Dict:
        """
        Download the latest TEMPO data for specified products.
        
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
            self.logger.info(f"Processing {product.upper()} data")
            self.logger.info(f"{'='*60}")
            
            # Find latest data
            file_info = self.find_latest_data(product)
            
            if file_info:
                # Download the file
                downloaded_file = self.download_file(file_info)
                
                results[product] = {
                    'success': downloaded_file is not None,
                    'file_path': downloaded_file,
                    'date': file_info['date'],
                    'size_mb': file_info['size_mb'],
                    'granule_id': file_info['granule_id']
                }
            else:
                results[product] = {
                    'success': False,
                    'file_path': None,
                    'date': None,
                    'size_mb': 0,
                    'granule_id': None
                }
        
        return results

def main():
    """Main function to download latest TEMPO data."""
    print("TEMPO DATA DOWNLOADER")
    print("=" * 50)
    
    try:
        # Initialize downloader
        downloader = TempoDownloader()
        print("✓ TempoDownloader initialized")
        
        # Download latest data for both products
        print(f"\nDownloading latest TEMPO data...")
        results = downloader.download_latest_data(['no2', 'o3'])
        
        print(f"\nDownload Results:")
        for product, result in results.items():
            print(f"  {product.upper()}: {'✓ Success' if result['success'] else '✗ Failed'}")
            if result['success']:
                print(f"    File: {os.path.basename(result['file_path']) if result['file_path'] else 'None'}")
                print(f"    Date: {result['date']}")
                print(f"    Size: {result['size_mb']:.2f} MB")
        
        return results
        
    except Exception as e:
        print(f"✗ Download failed: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    main()
