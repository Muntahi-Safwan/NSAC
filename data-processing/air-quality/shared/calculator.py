"""
EPA AQI Calculator

Calculates Air Quality Index (AQI) values for individual pollutants
and determines overall AQI based on EPA methodology.
"""

from typing import Optional, Dict, Tuple
try:
    from .breakpoints import AQI_BREAKPOINTS, AQI_CATEGORIES
except ImportError:
    from breakpoints import AQI_BREAKPOINTS, AQI_CATEGORIES


class AQICalculator:
    """
    Calculate EPA Air Quality Index (AQI) for pollutants
    
    Reference: https://www.airnow.gov/aqi/aqi-basics/
    """
    
    # Molecular weights for unit conversions
    MW = {
        'o3': 48.00,   # Ozone
        'no2': 46.00,  # Nitrogen Dioxide
        'so2': 64.00,  # Sulfur Dioxide
        'co': 28.00,   # Carbon Monoxide
    }
    
    @staticmethod
    def calculate_aqi(concentration: float, breakpoints: list) -> int:
        """
        Calculate AQI using EPA's piecewise linear function
        
        AQI = [(I_high - I_low) / (C_high - C_low)] × (C - C_low) + I_low
        
        Args:
            concentration: Pollutant concentration
            breakpoints: List of (C_low, C_high, AQI_low, AQI_high) tuples
            
        Returns:
            AQI value (0-500)
        """
        if concentration < 0:
            return 0
        
        # Find the appropriate breakpoint range
        for c_low, c_high, aqi_low, aqi_high in breakpoints:
            if c_low <= concentration <= c_high:
                # Linear interpolation
                aqi = ((aqi_high - aqi_low) / (c_high - c_low)) * (concentration - c_low) + aqi_low
                return round(aqi)
        
        # If concentration exceeds all breakpoints, use the highest range
        if concentration > breakpoints[-1][1]:
            # Beyond hazardous - cap at 500 or extrapolate
            return 500
        
        return 0
    
    @staticmethod
    def ug_m3_to_ppm(ug_m3: float, molecular_weight: float, temp_k: float = 298.15, pressure_atm: float = 1.0) -> float:
        """
        Convert μg/m³ to ppm
        
        Formula: ppm = (μg/m³ × 24.45) / MW
        At 25°C and 1 atm: molar volume ≈ 24.45 L/mol
        
        Args:
            ug_m3: Concentration in μg/m³
            molecular_weight: Molecular weight in g/mol
            temp_k: Temperature in Kelvin (default 25°C = 298.15K)
            pressure_atm: Pressure in atmospheres (default 1.0)
            
        Returns:
            Concentration in ppm
        """
        # Ideal gas constant
        R = 0.08206  # L·atm/(mol·K)
        
        # Molar volume at given temp and pressure
        molar_volume = (R * temp_k) / pressure_atm  # L/mol
        
        # Convert μg/m³ to mg/m³ to mg/L to ppm
        mg_m3 = ug_m3 / 1000  # μg to mg
        mg_L = mg_m3 / 1000   # m³ to L
        ppm = (mg_L * molar_volume) / molecular_weight
        
        return ppm
    
    @staticmethod
    def ug_m3_to_ppb(ug_m3: float, molecular_weight: float, temp_k: float = 298.15, pressure_atm: float = 1.0) -> float:
        """
        Convert μg/m³ to ppb
        
        Args:
            ug_m3: Concentration in μg/m³
            molecular_weight: Molecular weight in g/mol
            temp_k: Temperature in Kelvin (default 25°C = 298.15K)
            pressure_atm: Pressure in atmospheres (default 1.0)
            
        Returns:
            Concentration in ppb
        """
        ppm = AQICalculator.ug_m3_to_ppm(ug_m3, molecular_weight, temp_k, pressure_atm)
        return ppm * 1000  # ppm to ppb
    
    @classmethod
    def calculate_pm25_aqi(cls, pm25_ug_m3: float) -> int:
        """Calculate AQI for PM2.5 (μg/m³)"""
        return cls.calculate_aqi(pm25_ug_m3, AQI_BREAKPOINTS['pm25'])
    
    @classmethod
    def calculate_pm10_aqi(cls, pm10_ug_m3: float) -> int:
        """Calculate AQI for PM10 (μg/m³)"""
        return cls.calculate_aqi(pm10_ug_m3, AQI_BREAKPOINTS['pm10'])
    
    @classmethod
    def calculate_o3_aqi(cls, o3_ug_m3: float, averaging_period: str = '8hr') -> int:
        """
        Calculate AQI for O3
        
        Args:
            o3_ug_m3: O3 concentration in μg/m³
            averaging_period: '8hr' or '1hr'
            
        Returns:
            AQI value
        """
        # Convert μg/m³ to ppm
        o3_ppm = cls.ug_m3_to_ppm(o3_ug_m3, cls.MW['o3'])
        
        if averaging_period == '8hr':
            return cls.calculate_aqi(o3_ppm, AQI_BREAKPOINTS['o3_8hr'])
        elif averaging_period == '1hr':
            # 1-hour O3 only used when >= 0.125 ppm
            if o3_ppm >= 0.125:
                return cls.calculate_aqi(o3_ppm, AQI_BREAKPOINTS['o3_1hr'])
            return 0
        else:
            raise ValueError("averaging_period must be '8hr' or '1hr'")
    
    @classmethod
    def calculate_co_aqi(cls, co_ug_m3: float) -> int:
        """Calculate AQI for CO (convert μg/m³ to ppm)"""
        co_ppm = cls.ug_m3_to_ppm(co_ug_m3, cls.MW['co'])
        return cls.calculate_aqi(co_ppm, AQI_BREAKPOINTS['co'])
    
    @classmethod
    def calculate_so2_aqi(cls, so2_ug_m3: float) -> int:
        """Calculate AQI for SO2 (convert μg/m³ to ppb)"""
        so2_ppb = cls.ug_m3_to_ppb(so2_ug_m3, cls.MW['so2'])
        return cls.calculate_aqi(so2_ppb, AQI_BREAKPOINTS['so2'])
    
    @classmethod
    def calculate_no2_aqi(cls, no2_ug_m3: float) -> int:
        """Calculate AQI for NO2 (convert μg/m³ to ppb)"""
        no2_ppb = cls.ug_m3_to_ppb(no2_ug_m3, cls.MW['no2'])
        return cls.calculate_aqi(no2_ppb, AQI_BREAKPOINTS['no2'])
    
    @classmethod
    def calculate_all_aqi(cls, pollutants: Dict[str, float]) -> Dict[str, int]:
        """
        Calculate AQI for all provided pollutants
        
        Args:
            pollutants: Dict with pollutant concentrations in μg/m³
                       Keys: 'pm25', 'pm10', 'o3', 'co', 'so2', 'no2'
                       
        Returns:
            Dict with AQI values for each pollutant
        """
        aqi_values = {}
        
        if 'pm25' in pollutants and pollutants['pm25'] is not None:
            aqi_values['pm25'] = cls.calculate_pm25_aqi(pollutants['pm25'])
        
        if 'pm10' in pollutants and pollutants['pm10'] is not None:
            aqi_values['pm10'] = cls.calculate_pm10_aqi(pollutants['pm10'])
        
        if 'o3' in pollutants and pollutants['o3'] is not None:
            aqi_values['o3'] = cls.calculate_o3_aqi(pollutants['o3'], '8hr')
        
        if 'co' in pollutants and pollutants['co'] is not None:
            aqi_values['co'] = cls.calculate_co_aqi(pollutants['co'])
        
        if 'so2' in pollutants and pollutants['so2'] is not None:
            aqi_values['so2'] = cls.calculate_so2_aqi(pollutants['so2'])
        
        if 'no2' in pollutants and pollutants['no2'] is not None:
            aqi_values['no2'] = cls.calculate_no2_aqi(pollutants['no2'])
        
        return aqi_values
    
    @classmethod
    def get_overall_aqi(cls, aqi_values: Dict[str, int]) -> Tuple[int, str]:
        """
        Determine overall AQI (highest of all pollutant AQIs)
        
        Args:
            aqi_values: Dict of pollutant AQI values
            
        Returns:
            Tuple of (overall_aqi, pollutant_name)
        """
        if not aqi_values:
            return 0, 'none'
        
        max_pollutant = max(aqi_values, key=aqi_values.get)
        max_aqi = aqi_values[max_pollutant]
        
        return max_aqi, max_pollutant
    
    @staticmethod
    def get_aqi_category(aqi: int) -> str:
        """Get AQI category name for a given AQI value"""
        for category, info in AQI_CATEGORIES.items():
            low, high = info['range']
            if low <= aqi <= high:
                return category
        
        if aqi > 500:
            return 'Hazardous'
        return 'Good'
    
    @staticmethod
    def get_aqi_color(aqi: int) -> str:
        """Get color code for a given AQI value"""
        category = AQICalculator.get_aqi_category(aqi)
        return AQI_CATEGORIES[category]['color']
    
    @staticmethod
    def get_aqi_description(aqi: int) -> str:
        """Get health description for a given AQI value"""
        category = AQICalculator.get_aqi_category(aqi)
        return AQI_CATEGORIES[category]['description']


