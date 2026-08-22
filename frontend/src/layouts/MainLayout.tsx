import { Link, Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <div>
      <header>
        <nav>
          <Link to="/">Technical Interview Reasoning Analyzer</Link>

          <div>
            <Link to="/">Dashboard</Link>
          </div>
        </nav>
      </header>

      <Outlet />
    </div>
  );
}

export default MainLayout;