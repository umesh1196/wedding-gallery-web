import type { BackendComment } from '../../lib/api/types';

interface ViewerCommentsProps {
  open: boolean;
  commentsEnabled: boolean;
  comments: BackendComment[];
  loading: boolean;
  submitting: boolean;
  draft: string;
  canSubmit: boolean;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
  onDelete: (commentId: string) => void;
}

function formatCommentTimestamp(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(parsed);
}

export function ViewerComments({
  open,
  commentsEnabled,
  comments,
  loading,
  submitting,
  draft,
  canSubmit,
  onDraftChange,
  onSubmit,
  onDelete,
}: ViewerCommentsProps) {
  if (!open) return null;

  if (!commentsEnabled) {
    return (
      <div className="mt-2.5 border-t border-foreground/10 pt-3">
        <p className="label text-foreground/35">Comments</p>
        <p className="mt-1 font-body text-sm text-foreground/62">
          Comments are disabled for this gallery.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-2.5 border-t border-foreground/10 pt-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="label text-foreground/35">Comments</p>
          <p className="mt-1 font-body text-sm text-foreground/62">
            Leave a note on this moment for the couple and their families.
          </p>
        </div>
        <span className="label text-foreground/35">{comments.length}</span>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              onSubmit();
            }
          }}
          placeholder="Add a comment..."
          className="min-w-0 flex-1 rounded-full border border-foreground/10 bg-foreground/5 px-4 py-3 font-body text-sm text-foreground outline-none placeholder:text-foreground/30"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit || submitting}
          className="label rounded-full bg-rose-accent px-4 py-3 text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </div>

      {loading ? (
        <p className="mt-3 font-body text-sm text-foreground/62">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="mt-3 font-body text-sm text-foreground/62">
          No comments yet. Be the first to leave one.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-2xl border border-foreground/8 bg-foreground/[0.03] px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-body text-sm text-foreground/88">
                    {comment.visitor_name || 'Guest'}
                  </p>
                  <p className="mt-1 font-body text-sm leading-relaxed text-foreground/72">
                    {comment.body}
                  </p>
                  <p className="mt-2 label text-foreground/35">
                    {formatCommentTimestamp(comment.created_at)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(comment.id)}
                  className="label text-foreground/42 transition hover:text-foreground/72"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
