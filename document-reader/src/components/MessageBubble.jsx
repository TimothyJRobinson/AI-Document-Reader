import SourceChunks from "./SourceChunks";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const notFound =
    !isUser &&
    message.content?.toLowerCase().includes("could not find that in the document");

  return (
    <div className={`flex gap-3 items-start ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
          isUser
            ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
            : "bg-zinc-800 dark:bg-zinc-600 text-white"
        }`}
      >
        {isUser ? "U" : "A"}
      </div>

      {/* Bubble + sources */}
      <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 rounded-br-sm"
              : notFound
              ? "bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-bl-sm"
              : "bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 shadow-sm rounded-bl-sm"
          }`}
        >
          {message.content}
        </div>
        {!isUser && <SourceChunks sources={message.sources} />}
      </div>
    </div>
  );
}