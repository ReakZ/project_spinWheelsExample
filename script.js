var padding = { top: 20, right: 40, bottom: 0, left: 0 },
  w = 500 - padding.left - padding.right,
  h = 500 - padding.top - padding.bottom,
  r = Math.min(w, h) / 2,
  rotation = 0,
  oldrotation = 0,
  picked = 100000,
  oldpick = [],
  color = d3.scale.category20(); //category20c()

let data = [
  { label: "Yes", value: 1, question: "Yes, allways Yes" },
  { label: "No", value: 2, question: "NoNoNo" },
];

//
let plus = document.querySelectorAll(".plus");
let blocks = document.querySelector(".blocks");
plus.forEach((element) => {
  element.addEventListener("click", addTextHandler);
});

function invertHex(hex) {
  if (hex.indexOf("#") === 0) {
    hex = hex.slice(1);
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
    throw new Error("Invalid HEX color.");
  }
  var r = parseInt(hex.slice(0, 2), 16),
    g = parseInt(hex.slice(2, 4), 16),
    b = parseInt(hex.slice(4, 6), 16);

  // invert color components
  r = (255 - r).toString(16);
  g = (255 - g).toString(16);
  b = (255 - b).toString(16);
  // pad each with zeros and return
  return "#" + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str, len) {
  len = len || 2;
  var zeros = new Array(len).join("0");
  return (zeros + str).slice(-len);
}
let currentLen = 2;
function addTextHandler(e) {
  e.preventDefault();
  let block = document.createElement("div");
  block.classList.add("block");
  block.dataset.id = currentLen;
  blocks.appendChild(block);
  currentLen += 1;
  let title = document.createElement("input");
  title.setAttribute("placeholder", "Title");
  title.classList.add("title");
  let description = document.createElement("input");
  description.setAttribute("placeholder", "Description");
  description.classList.add("description");
  let bp = document.createElement("button");
  bp.innerText = "+";
  bp.classList.add("button", "plus");
  bp.addEventListener("click", addTextHandler);
  let bm = document.createElement("button");
  bm.addEventListener("click", addDeleteHandler);
  bm.innerText = "-";
  bm.classList.add("button", "plus");
  block.appendChild(title);
  block.appendChild(description);
  block.appendChild(bp);
  block.appendChild(bm);
}

let minus = document.querySelectorAll(".minus");
minus.forEach((element) => {
  element.addEventListener("click", addDeleteHandler);
});

function addDeleteHandler(e) {

if(document.querySelectorAll('.block').length>1){

  e.preventDefault();
  data = data.filter((x) => x.value != e.target.parentElement.dataset.id);
  e.target.parentElement.remove();
}

}

let generate = document.querySelector(".generate");
generate.addEventListener("click", generateHandler);

function generateHandler(e) {
  data = [];
  let textBlocks = document.querySelectorAll(".block");
  textBlocks.forEach((x, i) => {
    if (x.children[0].value != "" && x.children[1].value) {
      data.push({
        label: x.children[0].value,
        value: i + 1,
        question: x.children[1].value,
      });
    }
  });
  document.getElementById("status").innerText = "";

  deploy();
}

function deploy() {
  let c = (document.querySelector("#chart").innerHTML = "");
  var svg = d3
    .select("#chart")
    .append("svg")
    .data([data])
    .attr("width", w + padding.left + padding.right)
    .attr("height", h + padding.top + padding.bottom);
  var container = svg
    .append("g")
    .attr("class", "chartholder")
    .attr(
      "transform",
      "translate(" + (w / 2 + padding.left) + "," + (h / 2 + padding.top) + ")"
    );
  var vis = container.append("g");

  var pie = d3.layout
    .pie()
    .sort(null)
    .value(function (d) {
      return 1;
    });
  // declare an arc generator function
  var arc = d3.svg.arc().outerRadius(r);
  // select paths, use arc generator to draw
  var arcs = vis
    .selectAll("g.slice")
    .data(pie)
    .enter()
    .append("g")
    .attr("class", "slice");

  arcs
    .append("path")
    .attr("fill", function (d, i) {
      return color(i);
    })
    .attr("d", function (d) {
      return arc(d);
    });
  // add the text
  arcs
    .append("text")
    .attr("transform", function (d) {
      d.innerRadius = 0;
      d.outerRadius = r;
      d.angle = (d.startAngle + d.endAngle) / 2;
      return (
        "rotate(" +
        ((d.angle * 180) / Math.PI - 90) +
        ")translate(" +
        (d.outerRadius - 10) +
        ")"
      );
    })
    .attr("text-anchor", "end")
    .text(function (d, i) {
      return data[i].label;
    });
  container.on("click", spin);

  //make arrow
  svg
    .append("g")
    .attr(
      "transform",
      "translate(" +
        (w + padding.left + padding.right) +
        "," +
        (h / 2 + padding.top) +
        ")"
    )
    .append("path")
    .attr("d", "M-" + r * 0.15 + ",0L0," + r * 0.05 + "L0,-" + r * 0.05 + "Z")
    .style({ fill: "red" });
  //draw spin circle
  container
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 60)
    .style({ fill: "green", cursor: "pointer" });
  //spin text
  container
    .append("text")
    .attr("x", 0)
    .attr("y", 10)
    .attr("text-anchor", "middle")
    .text("START")
    .style({ "font-weight": "bold", "font-size": "30px", fill: "white" });

  function spin(d) {
    container.on("click", null);
    //all slices have been seen, all done
    // console.log("OldPick: " + oldpick.length, "Data length: " + data.length);
    if (oldpick.length == data.length) {
      //console.log("done");
      document.getElementById("status").innerText =
        "All done , greate new list.";
      //container.on("click", null);
      oldpick.length = 0; // ^ new feat
      return;
    }
    var ps = 360 / data.length,
      pieslice = Math.round(1440 / data.length),
      rng = Math.floor(Math.random() * 1440 + 360);

    rotation = Math.round(rng / ps) * ps;

    picked = Math.round(data.length - (rotation % 360) / ps);
    picked = picked >= data.length ? picked % data.length : picked;
    if (oldpick.indexOf(picked) !== -1) {
      d3.select(this).call(spin);
      return;
    } else {
      oldpick.push(picked);
    }
    rotation += 90 - Math.round(ps / 2);
    vis
      .transition()
      .duration(3000)
      .attrTween("transform", rotTween)
      .each("end", function () {
        //mark question as seen
        d3.select(".slice:nth-child(" + (picked + 1) + ") path").attr(
          "fill",
          `${invertHex(color(picked + 1))}`
        );

        //populate question
        d3.select("#question h1").text(data[picked].question);
        oldrotation = rotation;

        /* Get the result value from object "data" */
        //  console.log(data[picked].value);

        /* Comment the below line for restrict spin to sngle time */
        container.on("click", spin);
      });
  }

  function rotTween(to) {
    var i = d3.interpolate(oldrotation % 360, rotation);
    return function (t) {
      return "rotate(" + i(t) + ")";
    };
  }

  function getRandomNumbers() {
    var array = new Uint16Array(1000);
    var scale = d3.scale.linear().range([360, 1440]).domain([0, 100000]);
    if (
      window.hasOwnProperty("crypto") &&
      typeof window.crypto.getRandomValues === "function"
    ) {
      window.crypto.getRandomValues(array);
    } else {
      //no support for crypto, get crappy random numbers
      for (var i = 0; i < 1000; i++) {
        array[i] = Math.floor(Math.random() * 100000) + 1;
      }
    }
    return array;
  }
}

deploy();
