// Font is loaded via CSS @import in globals.css
// No need for next/font import here

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var originalWarn = console.warn;
                console.warn = function() {
                  var msg = arguments[0] || '';
                  if (msg.includes && (msg.includes('google.maps.places.Autocomplete') || msg.includes('google.maps.Marker is deprecated'))) {
                    return;
                  }
                  originalWarn.apply(console, arguments);
                };
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
