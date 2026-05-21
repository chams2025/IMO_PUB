import { Outlet } from "react-router-dom";
import NavbarPrivate from "./NavbarPrivate";

function DashboardLayout() {
  return (
    <>
      <NavbarPrivate />

      <div
        style={{
          minHeight: "100vh",
          background: "#f5f7fb",
          paddingTop: "110px", // باش ما يطلعش تحت navbar
        }}
      >
        <Outlet />
      </div>
    </>
  );
}

export default DashboardLayout;