// import styles from "../styles/footer.module.css";

export default function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} RentEase. All rights reserved.</p>
      <div className="footer-links">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Contact Us</a>
      </div>
    </footer>
  );
}
