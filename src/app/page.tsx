import Game2048 from "@/components/Game2048"
import { GithubIcon } from "lucide-react"

export default function Home() {
  return (
    // Changed p-24 to p-4 sm:p-8 here
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 sm:p-8">
      <Game2048 />
      <footer className="w-full py-4 text-center mt-auto">
        <p className="text-slate-600 font-medium">Made By Rehan</p>
        <a
          href="https://github.com/rsayyed591/2048"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 text-indigo-500 hover:text-indigo-700 transition-colors font-bold mt-2"
        >
          <GithubIcon className="w-5 h-5" />
          @rsayyed591
        </a>
      </footer>
    </main>
  )
}