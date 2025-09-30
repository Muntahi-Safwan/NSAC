import React from 'react';

const UnifiedBackground = () => {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none">
      {/* Base dark background */}
      <div className="absolute inset-0 bg-black" />

      {/* SVG Background */}
      <svg
        className="absolute inset-0 w-full h-full object-cover"
        viewBox="0 0 1440 1024"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <g opacity="0.7" clipPath="url(#clip0_306_3033)">
          <rect width="1440" height="1024" fill="black" fillOpacity="0.6"/>

          {/* Top right orange/teal blob */}
          <g filter="url(#filter0_f_306_3033)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M1185.64 142.841C1231.75 138.672 1271.21 69.7055 1314.58 89.5929C1355.84 108.514 1372.85 176.011 1376.64 230.429C1380.05 279.547 1335.32 315.937 1333.76 365.201C1331.9 424.273 1389.59 481.896 1367.05 533.972C1346.15 582.278 1283.3 557.75 1242.02 577.218C1195.84 598.998 1160.33 654.414 1110.93 654.758C1056.26 655.138 977.929 644.193 962.232 579.165C943.685 502.334 456.268 792.433 465.965 713.134C471.582 667.199 999.231 281.903 1004.21 235.856C1009.59 186.191 1030.93 130.99 1068.23 111.869C1105.98 92.5167 1144.91 146.524 1185.64 142.841Z"
              fill="url(#paint0_linear_306_3033)"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M1185.64 142.841C1231.75 138.672 1271.21 69.7055 1314.58 89.5929C1355.84 108.514 1372.85 176.011 1376.64 230.429C1380.05 279.547 1335.32 315.937 1333.76 365.201C1331.9 424.273 1389.59 481.896 1367.05 533.972C1346.15 582.278 1283.3 557.75 1242.02 577.218C1195.84 598.998 1160.33 654.414 1110.93 654.758C1056.26 655.138 977.929 644.193 962.232 579.165C943.685 502.334 456.268 792.433 465.965 713.134C471.582 667.199 999.231 281.903 1004.21 235.856C1009.59 186.191 1030.93 130.99 1068.23 111.869C1105.98 92.5167 1144.91 146.524 1185.64 142.841Z"
              stroke="black"
            />
          </g>

          {/* Top left blue blob */}
          <g filter="url(#filter1_f_306_3033)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M183.846 26.4566C238.249 22.5022 284.812 -42.91 335.982 -24.0474C384.665 -6.10166 825.505 -54.5335 829.974 -2.91964C834.008 43.6674 360.452 190.632 358.617 237.357C356.417 293.385 424.488 348.038 397.9 397.43C373.238 443.247 299.081 419.983 250.372 438.448C195.877 459.105 153.978 511.665 95.6874 511.991C31.1883 512.352 -61.2409 501.971 -79.7627 440.294C-101.646 367.423 1.60049 312 13.0425 236.787C19.6704 193.219 -36.1062 158.352 -30.2269 114.677C-23.8859 67.5726 -123.771 -46.8508 -79.7626 -64.9869C-35.224 -83.3416 135.788 29.9497 183.846 26.4566Z"
              fill="#0B7B8A"
            />
          </g>

          {/* Bottom left dark teal blob */}
          <g filter="url(#filter2_f_306_3033)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M218.303 749.173C263.952 713.389 333.463 725.168 381.081 757.462C428.968 789.937 462.553 853.71 465.809 917.025C468.883 976.811 434.409 1032.32 397.405 1074.91C370.516 1105.87 325.291 1097.43 291.454 1117.73C273.726 1128.37 265.289 1150.96 248.864 1164.03C225.678 1182.47 203.602 1202.61 175.983 1209.59C132.859 1220.49 85.7275 1237.76 46.2375 1215.24C3.55461 1190.89 -38.0021 1141.86 -38 1087.54C-37.9978 1032.23 6.34597 987.828 46.2476 956.226C77.2067 931.707 129.526 965.523 155.441 934.337C196.22 885.263 169.422 787.49 218.303 749.173Z"
              fill="#0A4D57"
            />
          </g>

          {/* Bottom right dark teal blob */}
          <g filter="url(#filter3_f_306_3033)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M1286.3 839.173C1331.95 803.389 1401.46 815.168 1449.08 847.462C1496.97 879.937 1530.55 943.71 1533.81 1007.03C1536.88 1066.81 1502.41 1122.32 1465.41 1164.91C1438.52 1195.87 1393.29 1187.43 1359.45 1207.73C1341.73 1218.37 1333.29 1240.96 1316.86 1254.03C1293.68 1272.47 1271.6 1292.61 1243.98 1299.59C1200.86 1310.49 1153.73 1327.76 1114.24 1305.24C1071.55 1280.89 1030 1231.86 1030 1177.54C1030 1122.23 1074.35 1077.83 1114.25 1046.23C1145.21 1021.71 1197.53 1055.52 1223.44 1024.34C1264.22 975.263 1237.42 877.49 1286.3 839.173Z"
              fill="#0A4D57"
            />
          </g>
        </g>

        <defs>
          <filter id="filter0_f_306_3033" x="65.3225" y="-314.5" width="1712" height="1442" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
            <feGaussianBlur stdDeviation="200" result="effect1_foregroundBlur_306_3033"/>
          </filter>

          <filter id="filter1_f_306_3033" x="-541" y="-517" width="1821" height="1479" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
            <feGaussianBlur stdDeviation="225" result="effect1_foregroundBlur_306_3033"/>
          </filter>

          <filter id="filter2_f_306_3033" x="-538" y="227.244" width="1504" height="1499" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
            <feGaussianBlur stdDeviation="250" result="effect1_foregroundBlur_306_3033"/>
          </filter>

          <filter id="filter3_f_306_3033" x="530" y="317.244" width="1504" height="1499" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
            <feGaussianBlur stdDeviation="250" result="effect1_foregroundBlur_306_3033"/>
          </filter>

          <linearGradient id="paint0_linear_306_3033" x1="921.322" y1="86" x2="921.322" y2="727" gradientUnits="userSpaceOnUse">
            <stop stopColor="#14B8A6"/>
            <stop offset="1" stopColor="#0D9488"/>
          </linearGradient>

          <clipPath id="clip0_306_3033">
            <rect width="1440" height="1024" fill="white"/>
          </clipPath>
        </defs>
      </svg>

      {/* Additional atmospheric effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/20 to-slate-950/40" />
    </div>
  );
};

export default UnifiedBackground;