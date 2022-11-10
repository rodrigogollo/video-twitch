import { shallow, mount, render } from "enzyme";
import Video from "./Video";

it("expect to render Video component", () => {
  expect(shallow(<Video source={"clip1.mp4"} title={"test"} />).length).toEqual(
    1
  );
});
