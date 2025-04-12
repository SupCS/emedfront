export default function HeroBlob({ children }) {
  return (
    <svg
      viewBox="0 0 479 467"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      style={{ width: "100%", height: "100%" }}
    >
      <mask id="mask0">
        <path
          d="M9.19 145.96C34.02 76.58 114.86 54.73 184.11 29.48C245.8 6.99 311.86 -14.95 370.73 14.14C431.21 44.03 467.95 107.51 477.19 174.31C485.9 237.23 454.93 294.38 416.51 344.95C373.74 401.25 326.07 462.8 255.44 466.19C179.42 469.83 111.55 422.14 65.16 361.81C17.48 299.81 -17.16 219.58 9.19 145.96Z"
          fill="#ffffff"
        />
      </mask>
      <g mask="url(#mask0)">
        <path
          d="M9.19 145.96C34.02 76.58 114.86 54.73 184.11 29.48C245.8 6.99 311.86 -14.95 370.73 14.14C431.21 44.03 467.95 107.51 477.19 174.31C485.9 237.23 454.93 294.38 416.51 344.95C373.74 401.25 326.07 462.8 255.44 466.19C179.42 469.83 111.55 422.14 65.16 361.81C17.48 299.81 -17.16 219.58 9.19 145.96Z"
          fill="#CAE9FF"
        />
        <foreignObject x="0" y="0" width="100%" height="100%">
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {children}
          </div>
        </foreignObject>
      </g>
    </svg>
  );
}
