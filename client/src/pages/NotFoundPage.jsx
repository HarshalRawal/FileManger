import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"

export default function NotFoundPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-4 text-center">
      <h1 className="mb-4 text-4xl font-bold">404</h1>
      <p className="mb-6 text-xl">Page not found</p>
      <p className="mb-8 max-w-md text-muted-foreground">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button asChild>
        <Link to="/">Go back home</Link>
      </Button>
    </div>
  )
}
