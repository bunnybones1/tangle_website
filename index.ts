import { Tangle, TangleState, UserId } from "../tangle/tangle_ts/src/index";

async function setup_demo1() {
  set_random_name();

  let canvas = document.getElementById("demo2d")! as HTMLCanvasElement;
  canvas.style.opacity = "0.0";

  var context2d = canvas.getContext("2d")!;

  let canvas2 = document.getElementById("demoWebGl")! as HTMLCanvasElement;
  canvas2.style.opacity = "0.0";

  var contextWebGl = canvas2.getContext("webgl", {
    alpha: true,
  })!;

  let fixed_update_interval = 1000 / 60;

  const cachedShapes: Map<string, number[]> = new Map();
  let currentShape: number[];

  function startCurrentShape(x: number, y: number) {
    currentShape = [x, y];
  }

  function describeCurrentShape(x: number, y: number) {
    currentShape.push(x, y);
  }

  function endCurrentShape() {
    let hash = currentShape
      .reduce((p, c) => (p * 13589827.123 + c * 14345235.231) % 1, 0)
      .toString();
    if (!cachedShapes.has(hash)) {
      cachedShapes.set(hash, currentShape);
    }
    if (currentShape.length > 2) {
      context2d.moveTo(currentShape[0], currentShape[1]);
      for (let i = 2; i < currentShape.length; i += 2) {
        context2d.lineTo(currentShape[i], currentShape[i + 1]);
      }
      context2d.fill();
    }
  }

  let imports = {
    env: {
      set_color: function (r: number, g: number, b: number, a: number) {
        context2d.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
      },
      draw_circle: function (x: number, y: number, radius: number) {
        //extra_elements.push(addSVGCircle(x, y, radius));
        context2d.beginPath();
        context2d.arc(x, y, radius, 0, 2 * Math.PI);
        context2d.fill();
      },
      draw_ball: function (radius: number) {
        //extra_elements.push(addSVGCircle(x, y, radius));
        context2d.beginPath();
        context2d.arc(0, 0, radius, 0, 2 * Math.PI);
        context2d.fill();
      },
      draw_fast_ball: function (
        radius: number,
        ma: number,
        mb: number,
        mc: number,
        md: number,
        me: number,
        mf: number,
        cr: number,
        cg: number,
        cb: number
      ) {
        context2d.fillStyle = `rgba(${cr}, ${cg}, ${cb}, 255)`;
        context2d.setTransform(ma, mb, mc, md, me, mf);
        //extra_elements.push(addSVGCircle(x, y, radius));
        context2d.beginPath();
        context2d.arc(0, 0, radius, 0, 2 * Math.PI);
        context2d.fill();
      },
      begin_draw_fast_poly: function (
        x: number,
        y: number,
        ma: number,
        mb: number,
        mc: number,
        md: number,
        me: number,
        mf: number,
        cr: number,
        cg: number,
        cb: number
      ) {
        context2d.fillStyle = `rgba(${cr}, ${cg}, ${cb}, 255)`;
        context2d.setTransform(ma, mb, mc, md, me, mf);
        startCurrentShape(x, y);
      },
      draw_next_poly_vert: function (x: number, y: number) {
        describeCurrentShape(x, y);
      },
      end_draw_fast_poly: function () {
        endCurrentShape();
      },
      begin_path: function () {
        context2d.beginPath();
      },
      move_to: function (x: number, y: number) {
        startCurrentShape(x, y);
        // context2d.moveTo(x, y);
      },
      line_to: function (x: number, y: number) {
        describeCurrentShape(x, y);
        // context2d.lineTo(x, y);
      },
      stroke: function () {
        context2d.stroke();
      },
      fill: function () {
        endCurrentShape();
        // context2d.fill();
      },
      translate: function (x: number, y: number) {
        context2d.translate(x, y);
      },
      rotate: function (radians: number) {
        context2d.rotate(radians);
      },
      draw_rect: function (
        x: number,
        y: number,
        width: number,
        height: number
      ) {
        context2d.beginPath();
        context2d.rect(x, y, width, height);
        context2d.fill();
      },
      draw_fast_rect: function (
        x: number,
        y: number,
        width: number,
        height: number,
        ma: number,
        mb: number,
        mc: number,
        md: number,
        me: number,
        mf: number,
        cr: number,
        cg: number,
        cb: number
      ) {
        context2d.fillStyle = `rgba(${cr}, ${cg}, ${cb}, 255)`;
        context2d.setTransform(ma, mb, mc, md, me, mf);
        context2d.beginPath();
        context2d.rect(x, y, width, height);
        context2d.fill();
      },
      set_transform: function (
        a: number,
        b: number,
        c: number,
        d: number,
        e: number,
        f: number
      ) {
        context2d.setTransform(a, b, c, d, e, f);
      },
    },
  };

  let wasm_binary = await fetch("rust_project.wasm").then((response) =>
    response.arrayBuffer()
  );

  let result = await Tangle.instantiate(new Uint8Array(wasm_binary), imports, {
    fixed_update_interval,
    on_state_change_callback: (state) => {
      if (state == TangleState.Connected) {
        canvas.style.opacity = "1.0";
        canvas2.style.opacity = "1.0";
        if (exports.player_joined) {
          exports.player_joined(UserId);
        }
      }
    },
  });
  let tangle = result.tangle;
  let exports = result.instance.exports;

  document.onpointerdown = async (event) => {
    let rect = canvas.getBoundingClientRect();
    if (exports.pointer_down) {
      exports.pointer_down(
        UserId,
        event.pointerId,
        event.clientX - rect.left,
        event.clientY - rect.top
      );
    }
  };

  document.onpointermove = async (event) => {
    let rect = canvas.getBoundingClientRect();
    if (exports.pointer_move) {
      exports.pointer_move(
        UserId,
        event.pointerId,
        event.clientX - rect.left,
        event.clientY - rect.top
      );
    }
  };

  document.onpointerup = async (event) => {
    let rect = canvas.getBoundingClientRect();

    if (exports.pointer_up) {
      exports.pointer_up(
        UserId,
        event.pointerId,
        event.pointerType === "mouse",
        event.clientX - rect.left,
        event.clientY - rect.top
      );
    }
  };

  document.onkeydown = async (event) => {
    if (exports.key_down) {
      exports.key_down(UserId, event.keyCode);
    }

    /*
        if (event.key == "h") {
            tangle.print_history();
        }
        */
  };

  document.onkeyup = async (event) => {
    if (exports.key_up) {
      exports.key_up(UserId, event.keyCode);
    }
  };

  async function animation() {
    if (
      canvas.width != canvas.clientWidth ||
      canvas.height != canvas.clientHeight
    ) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }

    context2d.clearRect(0, 0, context2d.canvas.width, context2d.canvas.height);
    contextWebGl.clearColor(
      Math.random() * 0.1,
      Math.random() * 0.1,
      Math.random() * 0.1,
      0.01
    );
    contextWebGl.clear(contextWebGl.COLOR_BUFFER_BIT);

    exports.draw.callAndRevert();

    window.requestAnimationFrame(animation);
  }
  animation();
}

function set_random_name() {
  if (!window.location.hash) {
    window.location.hash +=
      ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    window.location.hash +=
      ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    window.location.hash +=
      ANIMAL_NAMES[Math.floor(Math.random() * ANIMAL_NAMES.length)];
  }
}

const ANIMAL_NAMES = [
  "Albatross",
  "Alligator",
  "Alpaca",
  "Antelope",
  "Donkey",
  "Badger",
  "Bat",
  "Bear",
  "Bee",
  "Bison",
  "Buffalo",
  "Butterfly",
  "Camel",
  "Capybara",
  "Cat",
  "Cheetah",
  "Chicken",
  "Chinchilla",
  "Clam",
  "Cobra",
  "Crab",
  "Crane",
  "Crow",
  "Deer",
  "Dog",
  "Dolphin",
  "Dove",
  "Dragonfly",
  "Duck",
  "Eagle",
  "Elephant",
  "Elk",
  "Emu",
  "Falcon",
  "Ferret",
  "Finch",
  "Fish",
  "Flamingo",
  "Fox",
  "Frog",
  "Gazelle",
  "Gerbil",
  "Giraffe",
  "Goat",
  "Goldfish",
  "Goose",
  "Grasshopper",
  "Hamster",
  "Heron",
  "Horse",
  "Hyena",
  "Jaguar",
  "Jellyfish",
  "Kangaroo",
  "Koala",
  "Lemur",
  "Lion",
  "Lobster",
  "Manatee",
  "Mantis",
  "Meerkat",
  "Mongoose",
  "Moose",
  "Mouse",
  "Narwhal",
  "Octopus",
  "Okapi",
  "Otter",
  "Owl",
  "Panther",
  "Parrot",
  "Pelican",
  "Penguin",
  "Pony",
  "Porcupine",
  "Rabbit",
  "Raccoon",
  "Raven",
  "Salmon",
  "Seahorse",
  "Seal",
  "Shark",
  "Snake",
  "Sparrow",
  "Stingray",
  "Stork",
  "Swan",
  "Tiger",
  "Turtle",
  "Viper",
  "Walrus",
  "Wolf",
  "Wolverine",
  "Wombat",
  "Yak",
  "Zebra",
  "Gnome",
  "Unicorn",
  "Dragon",
  "Hippo",
];

const ADJECTIVES = [
  "Beefy",
  "Big",
  "Bold",
  "Brave",
  "Bright",
  "Buff",
  "Calm",
  "Charming",
  "Chill",
  "Creative",
  "Cute",
  "Cool",
  "Crafty",
  "Cunning",
  "Daring",
  "Elegant",
  "Excellent",
  "Fab",
  "Fluffy",
  "Grand",
  "Green",
  "Happy",
  "Heavy",
  "Honest",
  "Huge",
  "Humble",
  "Iconic",
  "Immense",
  "Jolly",
  "Jumbo",
  "Kind",
  "Little",
  "Loyal",
  "Lucky",
  "Majestic",
  "Noble",
  "Nefarious",
  "Odd",
  "Ornate",
  "Plucky",
  "Plump",
  "Polite",
  "Posh",
  "Quirky",
  "Quick",
  "Round",
  "Relaxed",
  "Rotund",
  "Shy",
  "Sleek",
  "Sly",
  "Spry",
  "Stellar",
  "Super",
  "Tactical",
  "Tidy",
  "Trendy",
  "Unique",
  "Vivid",
  "Wild",
  "Yappy",
  "Young",
  "Zany",
  "Zesty",
];

setup_demo1();
