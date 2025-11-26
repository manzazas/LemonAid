\section{Project Overview}
\textbf{Name:} LemonAid \
\textbf{Purpose:} Analyze Amazon product listings using the Rainforest API, compute a heuristic ``Lemon Score,'' cache results in MongoDB, and present the analysis through a small React frontend.

\section{Features}
\begin{itemize}
\item Fetch product data from the Rainforest product endpoint.
\item Compute a rule-based Lemon Score (reviews, seller, price, listing quality, age).
\item Cache results in MongoDB using a TTL index.
\item React UI (Vite + React) with client-side routing.
\item JSON view, score breakdown, and human-readable reasons.
\end{itemize}

\section{Repository Layout}
\begin{verbatim}
backend/ Express server
index.js Main POST /api/url-post endpoint
services/analyze.js Lemon score logic
models/listing.js Mongoose schema + TTL index

frontend/ Vite + React app
App.jsx Main UI and API calls
Header.jsx Navbar
Features.jsx Features page
App.css, Features.css Styles
\end{verbatim}

\section{Prerequisites}
Node.js (v18+ recommended), npm/yarn, a Rainforest API key, and a MongoDB instance (local or Atlas).

\section{Environment Variables}
Create \texttt{backend/.env}:
\begin{verbatim}
MONGO_URI=...
RAINFOREST_API_KEY=...
PORT=3000
\end{verbatim}
If \texttt{MONGO_URI} is omitted, the server runs without caching.

\section{Installation}
Backend:
\begin{verbatim}
cd backend
npm install
\end{verbatim}

Frontend:
\begin{verbatim}
cd frontend
npm install
\end{verbatim}

\section{Running (Development)}
Backend:
\begin{verbatim}
cd backend
npm run dev
\end{verbatim}

Frontend:
\begin{verbatim}
cd frontend
npm run dev
\end{verbatim}

\section{Build (Production)}
Frontend:
\begin{verbatim}
npm run build
\end{verbatim}

Backend:
\begin{verbatim}
NODE_ENV=production node ./bin/www
\end{verbatim}

\section{How It Works}
\begin{enumerate}
\item User submits an Amazon URL.
\item Backend extracts the ASIN.
\item Backend checks MongoDB for a cached listing.
\item If cached, returns stored analysis.
\item If not, calls Rainforest, computes the Lemon Score, saves the record, and returns all data.
\end{enumerate}

Frontend displays the score (0--100), label, breakdown, reasons, and optional raw JSON.

\section{API}
\textbf{POST /api/url-post} \
Body:
\begin{verbatim}
{ "url": "https://www.amazon.com/dp/B012345678
" }
\end{verbatim}

Response:
\begin{verbatim}
{
itemId: "ASIN",
rainforestData: {...},
analysis: {...},
saved: { id: "..." },
cached: true | false
}
\end{verbatim}

\section{Analyzer Notes}
Implemented in \texttt{backend/services/analyze.js}.
Sub-scores include reviews, seller signals, price comparison, listing quality, and listing age.
Final Lemon Score is clamped to 0--100 and includes a label, breakdown, and reasons.

\section{Database}
TTL-enabled schema in \texttt{listing.js} with fields: listingId, raw, analysis, fetchedAt.
Entries expire after seven days.
Upsert performed with \texttt{findOneAndUpdate(..., { upsert: true })}.

\section{Troubleshooting}
\begin{itemize}
\item Ensure Atlas IP is whitelisted if MongoDB fails to connect.
\item To run without DB caching, remove \texttt{MONGO_URI}.
\item Validate Rainforest API key and endpoint structure if analysis is incorrect.
\end{itemize}

\section{Testing}
\begin{verbatim}
curl -X POST http://localhost:3000/api/url-post

-H "Content-Type: application/json"
-d '{"url":"https://www.amazon.com/dp/B012345678"}
'
\end{verbatim}

\section{Contributing}
Fork, create a branch, submit a pull request.
Update this document if major configuration changes are introduced.

\section{License}
MIT license recommended.
