import { useState, useCallback, useEffect } from "react";

export function SecondsCounter(props: { time: number | Date }) {
  const [text, setText] = useState("");

  const time = props.time instanceof Date ? props.time.getTime() : props.time;

  const update = useCallback(() => {
    const f = new Intl.RelativeTimeFormat();
    const relative = Math.floor((time - Date.now()) / 1000);
    setText(f.format(relative, "seconds"));
  }, [time]);

  useEffect(() => {
    update();
    const interval = setInterval(update, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [update]);

  return text;
}
