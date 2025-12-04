import 'bootstrap/dist/css/bootstrap.min.css';
import './semantic-custom.css';
import './globals.css';

export const metadata = {
  title: 'CSV Analyzer',
  description: 'Analyze, generate, and update CSV files',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
