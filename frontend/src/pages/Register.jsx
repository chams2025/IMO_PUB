import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

function Register() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate("/login#signup", { replace: true })
  }, [])
  return null
}

export default Register