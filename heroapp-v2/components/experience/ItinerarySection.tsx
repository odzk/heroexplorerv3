'use client';

import { useState } from 'react';
import { MapPin, Clock, Check, X as XIcon, ChevronDown, Utensils } from 'lucide-react';
import type {
  ViatorItinerary,
  ViatorItineraryDuration,
  ViatorItineraryItem,
  ViatorItineraryDay,
  ViatorItineraryRoute,
} from '@/lib/types';

// Renders Viator's polymorphic `itinerary` object as a "What to expect"
// section, matching viator.com. Location names arrive pre-resolved from the
// backend (see heroapi-v2/src/lib/itineraryLocations.ts) as
// `resolvedLocations[ref]`, since Viator's itinerary items only carry an
// opaque `LOC-...` ref, never a name. Every value rendered below is read as
// a named string/number field — never spread as a raw object into JSX.

interface ItinerarySectionProps {
  itinerary?: ViatorItinerary;
  resolvedLocations?: Record<string, { name?: string; address?: string }>;
}

function formatItemDuration(d?: ViatorItineraryDuration): string {
  if (!d) return '';
  if (d.fixedDurationInMinutes) {
    const h = Math.floor(d.fixedDurationInMinutes / 60);
    const m = d.fixedDurationInMinutes % 60;
    if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
    return m > 0 ? `${m} min` : '';
  }
  if (d.variableDurationFromMinutes && d.variableDurationToMinutes) {
    return `${d.variableDurationFromMinutes}–${d.variableDurationToMinutes} min`;
  }
  return d.description ?? '';
}

function AdmissionBadge({ status }: { status?: 'YES' | 'NO' | 'NOT_APPLICABLE' }) {
  if (!status || status === 'NOT_APPLICABLE') return null;
  const included = status === 'YES';
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
      style={{
        background: included ? 'rgba(74,143,110,0.1)' : 'rgba(152,38,73,0.08)',
        color: included ? 'var(--nv-success)' : 'var(--nv-cherry-rose)',
      }}
    >
      {included ? <Check size={11} /> : <XIcon size={11} />}
      {included ? 'Admission included' : 'Admission not included'}
    </span>
  );
}

function StopItem({
  item,
  index,
  resolvedLocations,
}: {
  item: ViatorItineraryItem;
  index: number;
  resolvedLocations?: Record<string, { name?: string; address?: string }>;
}) {
  const ref = item.pointOfInterestLocation?.location?.ref;
  const resolved = ref ? resolvedLocations?.[ref] : undefined;
  const name = resolved?.name || `Stop ${index + 1}`;
  const dur = formatItemDuration(item.duration);

  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center flex-shrink-0">
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ background: 'var(--nv-blue-slate)' }}
        >
          {index + 1}
        </span>
        <span className="w-px flex-1 mt-1" style={{ background: 'var(--nv-border)' }} />
      </div>
      <div className="pb-5 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <MapPin size={14} style={{ color: 'var(--nv-steel-blue)' }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--nv-text-heading)' }}>
            {item.passByWithoutStopping ? `Pass by: ${name}` : `Stop: ${name}`}
          </span>
        </div>
        {resolved?.address && (
          <p className="text-xs mb-1" style={{ color: 'var(--nv-text-muted)' }}>{resolved.address}</p>
        )}
        {item.description && (
          <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--nv-text-body)' }}>{item.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {dur && (
            <span className="inline-flex items-center gap-1 text-xs" style={{ color: 'var(--nv-text-muted)' }}>
              <Clock size={11} /> {dur}
            </span>
          )}
          <AdmissionBadge status={item.admissionIncluded} />
        </div>
      </div>
    </li>
  );
}

function DayBlock({
  day,
  resolvedLocations,
  defaultOpen,
}: {
  day: ViatorItineraryDay;
  resolvedLocations?: Record<string, { name?: string; address?: string }>;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--nv-border-hair)' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 text-left"
        style={{ background: 'var(--nv-surface-page)' }}
      >
        <span className="font-semibold text-sm" style={{ color: 'var(--nv-text-heading)' }}>
          {typeof day.dayNumber === 'number' ? `Day ${day.dayNumber}` : 'Day'}
          {day.title ? ` — ${day.title}` : ''}
        </span>
        <ChevronDown size={16} style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 150ms ease' }} />
      </button>
      {open && (
        <div className="p-4">
          {day.items?.length ? (
            <ul className="space-y-0">
              {day.items.map((item, i) => (
                <StopItem key={i} item={item} index={i} resolvedLocations={resolvedLocations} />
              ))}
            </ul>
          ) : null}
          {day.accommodations?.length ? (
            <div className="mt-2 text-xs" style={{ color: 'var(--nv-text-muted)' }}>
              {day.accommodations.map((a, i) => (a.description ? <p key={i}>🛏 {a.description}</p> : null))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function RouteBlock({
  route,
  resolvedLocations,
}: {
  route: ViatorItineraryRoute;
  resolvedLocations?: Record<string, { name?: string; address?: string }>;
}) {
  return (
    <div className="rounded-xl p-4" style={{ border: '1px solid var(--nv-border-hair)' }}>
      <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--nv-text-heading)' }}>
        {route.name || 'Route'}
      </h3>
      {route.operatingSchedule && (
        <p className="text-xs mb-3 whitespace-pre-line" style={{ color: 'var(--nv-text-muted)' }}>
          {route.operatingSchedule}
        </p>
      )}
      {route.stops?.length ? (
        <ul className="space-y-1.5">
          {route.stops.map((stop, i) => {
            const ref = stop.stopLocation?.ref;
            const name = (ref && resolvedLocations?.[ref]?.name) || stop.description || `Stop ${i + 1}`;
            return (
              <li key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--nv-text-body)' }}>
                <MapPin size={12} style={{ color: 'var(--nv-steel-blue)' }} />
                {name}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export default function ItinerarySection({ itinerary, resolvedLocations }: ItinerarySectionProps) {
  if (!itinerary) return null;
  const type = itinerary.itineraryType;

  const hasContent =
    (itinerary.itineraryItems && itinerary.itineraryItems.length > 0) ||
    (itinerary.days && itinerary.days.length > 0) ||
    (itinerary.routes && itinerary.routes.length > 0) ||
    itinerary.unstructuredDescription ||
    itinerary.unstructuredItinerary ||
    itinerary.activityInfo?.description;

  if (!hasContent) return null;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold mb-3" style={{ fontFamily: 'var(--font-comfortaa)', color: 'var(--nv-text-heading)' }}>
        What to expect
      </h2>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {itinerary.skipTheLine && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: 'rgba(107,161,191,0.12)', color: 'var(--nv-steel-blue)' }}>
            Skip the line
          </span>
        )}
        {itinerary.privateTour === true && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: 'rgba(107,161,191,0.12)', color: 'var(--nv-steel-blue)' }}>
            Private tour
          </span>
        )}
        {itinerary.privateTour === false && itinerary.maxTravelersInSharedTour && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: 'rgba(107,161,191,0.12)', color: 'var(--nv-steel-blue)' }}>
            Shared tour · max {itinerary.maxTravelersInSharedTour} travelers
          </span>
        )}
      </div>

      {/* STANDARD / ACTIVITY with structured stops */}
      {itinerary.itineraryItems && itinerary.itineraryItems.length > 0 && (
        <ul className="space-y-0">
          {itinerary.itineraryItems.map((item, i) => (
            <StopItem key={i} item={item} index={i} resolvedLocations={resolvedLocations} />
          ))}
        </ul>
      )}

      {/* ACTIVITY without discrete stops */}
      {(!itinerary.itineraryItems || itinerary.itineraryItems.length === 0) && itinerary.activityInfo?.description && (
        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--nv-text-body)' }}>
          {itinerary.activityInfo.description}
        </p>
      )}
      {itinerary.foodMenus && itinerary.foodMenus.length > 0 && (
        <div className="mt-2">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5" style={{ color: 'var(--nv-text-heading)' }}>
            <Utensils size={14} /> Food included
          </h3>
          <ul className="space-y-1">
            {itinerary.foodMenus.map((f, i) => (
              <li key={i} className="text-sm" style={{ color: 'var(--nv-text-body)' }}>
                {f.dishName ? <strong>{f.dishName}</strong> : null}
                {f.dishDescription ? ` — ${f.dishDescription}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* MULTI_DAY_TOUR */}
      {itinerary.days && itinerary.days.length > 0 && (
        <div className="space-y-3">
          {itinerary.days.map((day, i) => (
            <DayBlock key={i} day={day} resolvedLocations={resolvedLocations} defaultOpen={i === 0} />
          ))}
        </div>
      )}

      {/* HOP_ON_HOP_OFF */}
      {itinerary.routes && itinerary.routes.length > 0 && (
        <div className="space-y-3">
          {itinerary.routes.map((route, i) => (
            <RouteBlock key={i} route={route} resolvedLocations={resolvedLocations} />
          ))}
        </div>
      )}

      {/* UNSTRUCTURED fallback */}
      {type === 'UNSTRUCTURED' && (
        <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--nv-text-body)' }}>
          {itinerary.unstructuredItinerary || itinerary.unstructuredDescription}
        </p>
      )}
    </div>
  );
}
