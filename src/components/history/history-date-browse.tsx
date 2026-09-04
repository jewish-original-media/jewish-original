import { GREGORIAN_MONTH_NAMES } from "@/lib/history/format-date";

const days = Array.from({ length: 31 }, (_, index) => index + 1);

export function HistoryDateBrowse({
  month,
  day,
}: {
  month?: number;
  day?: number;
}) {
  return (
    <form className="history-date-browse" method="get" action="/history">
      <fieldset className="history-date-browse__fields">
        <legend className="sr-only">Browse Jewish history by date</legend>
        <div className="history-date-browse__field">
          <label htmlFor="history-month">Month</label>
          <select
            defaultValue={month ? String(month) : ""}
            id="history-month"
            name="month"
            required
          >
            <option value="" disabled>
              Month
            </option>
            {GREGORIAN_MONTH_NAMES.slice(1).map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="history-date-browse__field">
          <label htmlFor="history-day">Day</label>
          <select
            defaultValue={day ? String(day) : ""}
            id="history-day"
            name="day"
            required
          >
            <option value="" disabled>
              Day
            </option>
            {days.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </fieldset>
      <button className="button button--secondary" type="submit">
        View this day
      </button>
    </form>
  );
}
