import Header from "./Header";
import "./../styles/layout.css";

export default function Layout({ children }) {
  return (
    <div>
      <Header />
      <main className="content-area">{children}</main>
    </div>
  );
}
