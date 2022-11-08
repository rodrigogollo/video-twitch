import { Component } from "react";
import "./Filters.css";

type Props = {
  handleSubmit: (e: React.SyntheticEvent) => void;
};

type State = {
  name: string;
  type: string;
  qty: string;
};

class Filters extends Component<Props, State> {
  state: State = {
    name: "jerma985",
    type: "streamer",
    qty: "1",
  };

  onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    this.setState({ [e.target.name]: e.currentTarget.value } as Pick<
      State,
      keyof State
    >);
  };

  render() {
    return (
      <div className="filters">
        <form onSubmit={this.props.handleSubmit}>
          <select
            id="type"
            name="type"
            value={this.state.type}
            onChange={this.onChange}
          >
            <option value="game">Game</option>
            <option value="streamer">Streamer</option>
          </select>

          <input
            type="text"
            name="name"
            placeholder="type the game/streamer"
            value={this.state.name}
            onChange={this.onChange}
          />

          <input
            type="number"
            min={1}
            max={100}
            name="qty"
            value={this.state.qty}
            onChange={this.onChange}
          />

          <button type="submit">Search</button>
        </form>
      </div>
    );
  }
}

export default Filters;
