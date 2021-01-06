var padding = { top: 20, right: 40, bottom: 0, left: 0 },
  w = 500 - padding.left - padding.right,
  h = 500 - padding.top - padding.bottom,
  r = Math.min(w, h) / 2,
  rotation = 0,
  oldrotation = 0,
  picked = 100000,
  oldpick = [],
  color = d3.scale.category20(); //category20c()
//randomNumbers = getRandomNumbers();
//http://osric.com/bingo-card-generator/?title=HTML+and+CSS+BINGO!&words=padding%2Cfont-family%2Ccolor%2Cfont-weight%2Cfont-size%2Cbackground-color%2Cnesting%2Cbottom%2Csans-serif%2Cperiod%2Cpound+sign%2C%EF%B9%A4body%EF%B9%A5%2C%EF%B9%A4ul%EF%B9%A5%2C%EF%B9%A4h1%EF%B9%A5%2Cmargin%2C%3C++%3E%2C{+}%2C%EF%B9%A4p%EF%B9%A5%2C%EF%B9%A4!DOCTYPE+html%EF%B9%A5%2C%EF%B9%A4head%EF%B9%A5%2Ccolon%2C%EF%B9%A4style%EF%B9%A5%2C.html%2CHTML%2CCSS%2CJavaScript%2Cborder&freespace=true&freespaceValue=Web+Design+Master&freespaceRandom=false&width=5&height=5&number=35#results
let data = [
  { label: "Yes", value: 1, question: "Yes?" },
  { label: "No", value: 2, question: "No?" },
];

//
let plus = document.querySelectorAll(".plus");
let blocks = document.querySelector(".blocks");
plus.forEach((element) => {
  element.addEventListener("click", addTextHandler);
});

function addTextHandler(e) {
  e.preventDefault();

  let block = document.createElement("div");
  block.classList.add("block");
  block.dataset.id = data.length;
  blocks.appendChild(block);
  let title = document.createElement("input");
  title.setAttribute("placeholder", "text");
  title.classList.add("title");
  let description = document.createElement("input");
  description.setAttribute("placeholder", "description");
  description.classList.add("description");
  let bp = document.createElement("button");
  bp.innerText = "+";
  bp.addEventListener("click", addTextHandler);
  let bm = document.createElement("button");
  bm.addEventListener("click", addDeleteHandler);
  bm.innerText = "-";
  block.appendChild(title);
  block.appendChild(description);
  block.appendChild(bp);
  block.appendChild(bm);

  //             puzz.setAttribute("type", "button");
  //   puzz.classList.add("key");
  //   puzz.innerHTML = puzzles[element].value;
  //   puzz.dataset.key = element;
}

let minus = document.querySelectorAll(".minus");
minus.forEach((element) => {
  element.addEventListener("click", addDeleteHandler);
});

function addDeleteHandler(e) {
  e.preventDefault();
  data = data.filter((x) => x.value != e.target.parentElement.dataset.id);
  console.log(data);
  e.target.parentElement.remove();
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

  console.log(data);
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
    .style({ fill: "gray" });
  //draw spin circle
  container
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 60)
    .style({ fill: "white", cursor: "pointer" });
  //spin text
  container
    .append("text")
    .attr("x", 0)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .text("SPIN")
    .style({ "font-weight": "bold", "font-size": "30px" });

  function spin(d) {
    container.on("click", null);
    //all slices have been seen, all done
    console.log("OldPick: " + oldpick.length, "Data length: " + data.length);
    if (oldpick.length == data.length) {
      console.log("done");
      container.on("click", null);
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
          "#111"
        );
        //populate question
        d3.select("#question h1").text(data[picked].question);
        oldrotation = rotation;

        /* Get the result value from object "data" */
        console.log(data[picked].value);

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
      console.log("works");
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
