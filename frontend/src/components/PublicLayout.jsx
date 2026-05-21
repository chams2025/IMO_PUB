import { Outlet } from "react-router-dom"
import { useEffect, useState } from "react"
import { ACCESS_TOKEN } from "../constants"
import NavbarPublic from "./NavbarPublic"
import NavbarPrivate from "./NavbarPrivate"
import Footer from "./Footer"

function PublicLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem(ACCESS_TOKEN))

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem(ACCESS_TOKEN))
    }

    window.addEventListener("storage", checkAuth)

    return () => window.removeEventListener("storage", checkAuth)
  }, [])

  return (
    <>
      {isLoggedIn ? <NavbarPrivate /> : <NavbarPublic />}
      <Outlet />
      <Footer />
    </>
  )
}

export default PublicLayout