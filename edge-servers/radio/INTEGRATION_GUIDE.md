# Radio Station Integration Guide

This guide explains how to integrate the NSAC Radio Edge Server with different radio station infrastructures.

## Overview

The Radio Edge Server provides an abstract broadcasting interface that can be adapted to various radio station setups. The system includes a simulated broadcaster for testing and development, with clear interfaces for implementing real radio station connections.

## Architecture

### Broadcasting Interface

The system uses an abstract `RadioBroadcastInterface` that defines the core broadcasting operations:

```python
class RadioBroadcastInterface(ABC):
    @abstractmethod
    async def initialize(self) -> bool:
        """Initialize the broadcasting system"""
        pass

    @abstractmethod
    async def broadcast_audio(self, audio_file: str, frequency: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Broadcast audio file on specified frequency"""
        pass

    @abstractmethod
    async def broadcast_text(self, text: str, frequency: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Broadcast text as audio on specified frequency"""
        pass

    @abstractmethod
    async def get_status(self) -> Dict[str, Any]:
        """Get broadcasting system status"""
        pass

    @abstractmethod
    async def test_connection(self) -> bool:
        """Test connection to broadcasting equipment"""
        pass
```

## Integration Options

### 1. Software-Defined Radio (SDR)

For stations using SDR equipment:

```python
class SDRRadioBroadcaster(RadioBroadcastInterface):
    def __init__(self, sdr_device="hackrf"):
        self.sdr_device = sdr_device
        self.sdr = None

    async def initialize(self) -> bool:
        # Initialize SDR device
        self.sdr = HackRFOne()
        await self.sdr.open()
        return True

    async def broadcast_audio(self, audio_file: str, frequency: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        # Convert audio to RF signal
        # Transmit on specified frequency
        pass
```

### 2. Hardware Radio Equipment

For traditional radio station hardware:

```python
class HardwareRadioBroadcaster(RadioBroadcastInterface):
    def __init__(self, equipment_config):
        self.equipment_config = equipment_config
        self.transmitter = None

    async def initialize(self) -> bool:
        # Connect to radio station hardware
        # Initialize transmitter, mixer, etc.
        pass

    async def broadcast_audio(self, audio_file: str, frequency: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        # Send audio to transmitter
        # Set frequency and power
        # Start transmission
        pass
```

### 3. Radio Station API

For stations with existing API systems:

```python
class APIRadioBroadcaster(RadioBroadcastInterface):
    def __init__(self, api_endpoint, api_key):
        self.api_endpoint = api_endpoint
        self.api_key = api_key

    async def initialize(self) -> bool:
        # Test API connection
        # Authenticate with station API
        pass

    async def broadcast_audio(self, audio_file: str, frequency: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        # Upload audio file to station API
        # Schedule broadcast
        # Return broadcast confirmation
        pass
```

### 4. Audio File Output

For stations that prefer manual integration:

```python
class AudioFileBroadcaster(RadioBroadcastInterface):
    def __init__(self, output_directory="/radio/audio"):
        self.output_directory = output_directory

    async def broadcast_audio(self, audio_file: str, frequency: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        # Copy audio file to station's audio system
        # Create metadata file for station staff
        # Return file location for manual broadcast
        pass
```

## Implementation Steps

### Step 1: Choose Integration Method

Based on your radio station's infrastructure:

1. **SDR Equipment**: Use SDRRadioBroadcaster
2. **Traditional Hardware**: Use HardwareRadioBroadcaster
3. **Existing API**: Use APIRadioBroadcaster
4. **Manual Process**: Use AudioFileBroadcaster

### Step 2: Implement Custom Broadcaster

Create a new broadcaster class that implements `RadioBroadcastInterface`:

```python
# radio_station_broadcaster.py
from services.radio_broadcaster import RadioBroadcastInterface

class YourRadioStationBroadcaster(RadioBroadcastInterface):
    def __init__(self, your_config):
        self.config = your_config
        # Initialize your radio equipment

    async def initialize(self) -> bool:
        # Connect to your radio equipment
        # Test connections
        # Return success/failure
        pass

    async def broadcast_audio(self, audio_file: str, frequency: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        # Implement audio broadcasting for your equipment
        # Return broadcast result
        pass

    # Implement other required methods...
```

### Step 3: Configure Radio Broadcaster

Update the `RadioBroadcaster` class to use your implementation:

```python
# In services/radio_broadcaster.py
def _initialize_broadcaster(self):
    if self.broadcaster_type == "your_station":
        self.broadcaster = YourRadioStationBroadcaster(your_config)
    # ... other types
```

### Step 4: Environment Configuration

Add your station's configuration to the environment:

```bash
# In .env file
BROADCASTER_TYPE=your_station
RADIO_STATION_API_URL=https://your-station.com/api
RADIO_STATION_API_KEY=your_api_key
RADIO_FREQUENCIES=AM 1230,FM 101.5
```

## Common Integration Patterns

### Pattern 1: File-Based Integration

Many radio stations prefer file-based integration:

```python
async def broadcast_audio(self, audio_file: str, frequency: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
    # Copy audio file to station's hot folder
    station_audio_path = f"/station/audio/incoming/{os.path.basename(audio_file)}"
    shutil.copy2(audio_file, station_audio_path)

    # Create metadata file
    metadata_file = station_audio_path.replace('.wav', '.json')
    with open(metadata_file, 'w') as f:
        json.dump(metadata, f)

    # Notify station staff
    await self.notify_station_staff(frequency, metadata)

    return {"success": True, "file_path": station_audio_path}
```

### Pattern 2: API Integration

For stations with modern API systems:

```python
async def broadcast_audio(self, audio_file: str, frequency: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
    # Upload audio file
    with open(audio_file, 'rb') as f:
        files = {'audio': f}
        data = {
            'frequency': frequency,
            'metadata': json.dumps(metadata)
        }
        response = await self.api_client.post('/broadcast/upload', files=files, data=data)

    return response.json()
```

### Pattern 3: Hardware Integration

For direct hardware control:

```python
async def broadcast_audio(self, audio_file: str, frequency: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
    # Set transmitter frequency
    await self.transmitter.set_frequency(frequency)

    # Load audio file
    await self.audio_processor.load_file(audio_file)

    # Start transmission
    await self.transmitter.start_transmission()

    # Monitor transmission
    duration = metadata.get('duration_seconds', 30)
    await asyncio.sleep(duration)

    # Stop transmission
    await self.transmitter.stop_transmission()

    return {"success": True, "duration": duration}
```

## Testing and Validation

### 1. Use Simulated Broadcaster

Start with the simulated broadcaster to test the complete system:

```bash
# Set environment
BROADCASTER_TYPE=simulated

# Test the system
curl -X POST "http://localhost:8002/analysis/test"
```

### 2. Implement Your Broadcaster

Create your custom broadcaster implementation:

```python
# Test your implementation
broadcaster = YourRadioStationBroadcaster(config)
await broadcaster.initialize()
result = await broadcaster.broadcast_text("Test message", "AM 1230", {})
```

### 3. Integration Testing

Test with real equipment in a controlled environment:

```bash
# Test with your station's equipment
BROADCASTER_TYPE=your_station
python main.py
```

## Safety and Compliance

### FCC Compliance

Ensure your integration maintains FCC compliance:

- **Power Limits**: Respect transmitter power limits
- **Frequency Accuracy**: Maintain accurate frequency control
- **Emergency Override**: Implement emergency broadcast override
- **Logging**: Maintain broadcast logs for compliance

### Emergency Protocols

Implement emergency broadcast protocols:

```python
async def emergency_broadcast(self, message: str, frequency: str) -> Dict[str, Any]:
    # Override normal programming
    # Maximum power transmission
    # Extended duration
    # Emergency tone generation
    pass
```

## Support and Maintenance

### Monitoring

Implement monitoring for your integration:

```python
async def get_status(self) -> Dict[str, Any]:
    return {
        "equipment_status": await self.check_equipment(),
        "frequency_status": await self.check_frequency(),
        "power_status": await self.check_power(),
        "last_broadcast": self.last_broadcast_time
    }
```

### Error Handling

Implement robust error handling:

```python
async def broadcast_audio(self, audio_file: str, frequency: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
    try:
        # Broadcasting logic
        return {"success": True}
    except EquipmentError as e:
        # Handle equipment failures
        await self.alert_station_staff(f"Equipment error: {e}")
        return {"success": False, "error": str(e)}
    except FrequencyError as e:
        # Handle frequency conflicts
        return {"success": False, "error": "Frequency unavailable"}
```

## Getting Help

For integration support:

1. **Review the code**: Examine the abstract interface and simulated implementation
2. **Test with simulation**: Use the simulated broadcaster to understand the system
3. **Implement gradually**: Start with file-based integration, then move to API/hardware
4. **Contact support**: Reach out for assistance with specific radio equipment

## Example Implementations

See the `examples/` directory for:

- SDR integration examples
- API integration templates
- Hardware control examples
- File-based integration patterns

The system is designed to be flexible and adaptable to various radio station infrastructures while maintaining the core functionality of environmental analysis and AI-powered insights generation.

