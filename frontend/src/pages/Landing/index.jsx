import './Landing.css'
import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="content">
      <Link className="btn bigger-btn" to="/login">Log in</Link>
      <Link className="btn bigger-btn" to="/businesses">See all businesses</Link>
    </div>
  );
}

export default Landing;
