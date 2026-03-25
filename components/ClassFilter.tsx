'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface ClassFilterProps {
  classes: string[];
  selected: string;
}

export function ClassFilter({ classes, selected }: ClassFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set('class', e.target.value);
    } else {
      params.delete('class');
    }
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="class-filter" className="text-sm text-gray-600 whitespace-nowrap">
        Filter by class:
      </label>
      <select
        id="class-filter"
        value={selected}
        onChange={handleChange}
        className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">All Classes</option>
        {classes.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}
