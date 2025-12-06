import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ReportDisplayProps {
  markdown: string;
}

export const ReportDisplay: React.FC<ReportDisplayProps> = ({ markdown }) => {
  return (
    <div className="space-y-4">
      <div className="prose prose-sm md:prose-base prose-stone max-w-none prose-headings:text-yellow-900/80 prose-a:text-yellow-700 prose-strong:text-yellow-900 prose-li:marker:text-yellow-400">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            table: ({node, ...props}) => (
              <div className="overflow-x-auto my-4 rounded-xl border border-yellow-100 bg-[#FFFBEB]/50">
                <table className="min-w-full divide-y divide-yellow-100" {...props} />
              </div>
            ),
            thead: ({node, ...props}) => (
              <thead className="bg-[#FEF3C7]/40" {...props} />
            ),
            th: ({node, ...props}) => (
              <th className="px-4 py-3 text-left text-xs font-semibold text-yellow-800 uppercase tracking-wider" {...props} />
            ),
            td: ({node, ...props}) => (
              <td className="px-4 py-3 whitespace-nowrap text-sm text-stone-600 border-t border-yellow-50" {...props} />
            ),
            a: ({node, ...props}) => (
              <a className="text-yellow-700 hover:text-yellow-800 hover:underline font-medium decoration-yellow-300/50 decoration-2 underline-offset-2" target="_blank" rel="noopener noreferrer" {...props} />
            ),
            blockquote: ({node, ...props}) => (
              <blockquote className="border-l-4 border-yellow-200 pl-4 italic text-stone-500 my-4" {...props} />
            ),
            hr: ({node, ...props}) => (
              <hr className="border-yellow-100 my-6" {...props} />
            )
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
};