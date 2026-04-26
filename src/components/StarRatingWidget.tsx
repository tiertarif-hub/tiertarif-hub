'use client';

import { useState, useEffect } from 'react';
import { MessageSquareText, ThumbsUp, CircleAlert } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StarRatingWidgetProps {
  slug: string;
}

type FeedbackOption = {
  label: string;
  value: number;
  helper: string;
  icon: typeof ThumbsUp;
};

const FEEDBACK_OPTIONS: FeedbackOption[] = [
  {
    label: 'Sehr hilfreich',
    value: 5,
    helper: 'Klar, nützlich und direkt anwendbar.',
    icon: ThumbsUp,
  },
  {
    label: 'Teilweise hilfreich',
    value: 3,
    helper: 'Grundsätzlich hilfreich, aber noch ausbaufähig.',
    icon: MessageSquareText,
  },
  {
    label: 'Noch unklar',
    value: 1,
    helper: 'Hier fehlt noch etwas oder es braucht mehr Tiefe.',
    icon: CircleAlert,
  },
];

export function StarRatingWidget({ slug }: StarRatingWidgetProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState({ avg: 0, count: 0 });

  useEffect(() => {
    const voted = localStorage.getItem(`rs_voted_${slug}`);
    setHasVoted(!!voted);
    fetchStats();
  }, [slug]);

  const fetchStats = async () => {
    const { data, error } = await supabase
      .from('page_ratings')
      .select('seed_total_stars, seed_vote_count, real_total_stars, real_vote_count')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('[StarRatingWidget] Fetch error:', error);
      setStats({ avg: 0, count: 0 });
      return;
    }

    if (data) {
      const totalStars = Number(data.seed_total_stars || 0) + Number(data.real_total_stars || 0);
      const totalVotes = Number(data.seed_vote_count || 0) + Number(data.real_vote_count || 0);

      if (totalVotes > 0) {
        setStats({
          avg: Number((totalStars / totalVotes).toFixed(1)),
          count: totalVotes,
        });
      } else {
        setStats({ avg: 0, count: 0 });
      }
    } else {
      setStats({ avg: 0, count: 0 });
    }
  };

  const handleVote = async (value: number) => {
    if (hasVoted || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase.rpc('increment_real_rating', {
        page_slug: slug,
        submitted_stars: value,
      });

      if (error) throw error;

      localStorage.setItem(`rs_voted_${slug}`, 'true');
      setHasVoted(true);
      toast.success('Vielen Dank für dein Feedback!');
      fetchStats();
    } catch (error) {
      console.error('[StarRatingWidget] Error:', error);
      toast.error('Fehler beim Speichern deines Feedbacks.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg shadow-slate-200/30 mb-8">
      <div className="inline-flex items-center gap-2 rounded-full bg-[#FF8400]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#FF8400] mb-4">
        <MessageSquareText className="w-3.5 h-3.5" />
        Content-Feedback
      </div>

      <h3 className="text-lg font-bold tracking-tight text-[#0A0F1C] mb-2 leading-tight">
        War dieser redaktionelle Überblick hilfreich?
      </h3>

      <p className="text-sm text-slate-500 leading-relaxed mb-5">
        Gib uns ein kurzes, neutrales Feedback zum Inhalt – ganz ohne Sternebewertung.
      </p>

      <div className="flex flex-col gap-3">
        {FEEDBACK_OPTIONS.map((option) => {
          const Icon = option.icon;

          return (
            <button
              key={option.label}
              onClick={() => handleVote(option.value)}
              disabled={isSubmitting || hasVoted}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left transition-all hover:border-[#FF8400]/40 hover:bg-white hover:shadow-sm disabled:opacity-100"
            >
              <div className="flex items-center gap-2 mb-1.5 text-sm font-bold text-[#0A0F1C]">
                <Icon className="w-4 h-4 text-[#FF8400] shrink-0" />
                <span>{option.label}</span>
              </div>

              <p className="text-[13px] leading-relaxed text-slate-500">
                {option.helper}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-5 text-sm text-slate-500">
        {stats.count > 0 ? (
          <p className="leading-relaxed">
            <span className="text-[#0A0F1C] font-bold text-base">
              {Math.round((stats.avg / 5) * 100)} %
            </span>{' '}
            der Leser fanden diesen Beitrag hilfreich ({stats.count} Bewertungen)
          </p>
        ) : (
          <p>Sei der Erste, der diesen Ratgeber bewertet.</p>
        )}
      </div>

      {hasVoted && (
        <div className="mt-5 rounded-2xl border border-green-100 bg-green-50 p-4 animate-fade-in">
          <p className="text-green-800 font-semibold">Vielen Dank für dein Feedback!</p>
          <p className="text-sm text-green-600 mt-1 leading-relaxed">
            Deine Rückmeldung hilft uns, die Inhalte weiter zu verbessern.
          </p>
        </div>
      )}
    </div>
  );
}
