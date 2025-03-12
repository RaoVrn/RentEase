import Link from "next/link";
import { FaUserCircle } from "react-icons/fa"; // Importing User Icon

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link href="/" className="logo">🏠 RentEase</Link>
      <div className="nav-links">
        <Link href="/">Home</Link>
        <Link href="#">Houses</Link>
        <Link href="#">Flats</Link>
        <Link href="#">PGs</Link>
        <Link href="#">Contact</Link>
      </div>
      <div className="user-auth">
        <Link href="/login"><FaUserCircle className="user-icon" /></Link>
      </div>
    </nav>
  );
}
