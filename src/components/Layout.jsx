import "./../styles/layout.css";

export default function Layout({ children }) {
  return (
    <div>
      <main className="content-area">{children}</main>
    </div>
  );
}
