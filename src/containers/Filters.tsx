import { useRef } from "react";
import "./Filters.css";

type FiltersProps = {
  onHandleFilter: React.FormEvent;
};

export default function Filters({ onHandleFilter }: FiltersProps) {
  const inputType = useRef(null);
  const inputName = useRef(null);
  const inputQty = useRef(null);
  const formRef = useRef(null);

  return (
    <div className="filters">
      <form
        // method={onHandleFilter}
        ref={formRef}
      >
        <label htmlFor="type">Choose a type: </label>
        <select id="type" name="type" ref={inputType}>
          <option value="Game">Game</option>
          <option value="Streamer">Streamer</option>
        </select>

        <input
          type="text"
          name="name"
          placeholder="type the game/streamer"
          ref={inputName}
        />

        <input type="number" min={1} max={100} ref={inputQty} name="qty" />

        <button type="submit">Search</button>
      </form>
    </div>
  );
}
