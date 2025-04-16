const canvas = document.getElementById('flowerCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 600;
canvas.height = 600;

let flower = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  scale: 1,
  isDragging: false,
  offsetX: 0,
  offsetY: 0
};

// Draw a simple random color function
function randomColor() {
  return `hsl(${Math.random() * 360}, 70%, 60%)`;
}

// Function to draw a flower
function drawFlower(x, y, scale = 1) {
  const petalCount = 6;
  const petalLength = 80 * scale;
  const petalWidth = 30 * scale;

  // Draw petals
  for (let i = 0; i < petalCount; i++) {
    const angle = (i * Math.PI * 2) / petalCount;
    ctx.beginPath();
    ctx.ellipse(
      x + Math.cos(angle) * 100 * scale,
      y + Math.sin(angle) * 100 * scale,
      petalLength,
      petalWidth,
      angle,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = randomColor();
    ctx.fill();
  }

  // Draw flower center
  ctx.beginPath();
  ctx.arc(x, y, 40 * scale, 0, Math.PI * 2);
  ctx.fillStyle = randomColor();
  ctx.fill();
}

// Function to draw the stalk
function drawStalk() {
  ctx.beginPath();
  ctx.moveTo(flower.x, flower.y + 40 * flower.scale); // Start at the bottom of the flower
  ctx.lineTo(flower.x, flower.y + 200 * flower.scale); // Draw the stalk downwards
  ctx.lineWidth = 10 * flower.scale;
  ctx.strokeStyle = 'green';
  ctx.stroke();
}

// Function to draw branches
function drawBranches() {
  const branchCount = 2;
  const branchLength = 80 * flower.scale;

  // Draw branches sprouting from the stalk
  for (let i = 0; i < branchCount; i++) {
    const angle = (Math.PI / 2) * (i === 0 ? 1 : -1); // Branch angles
    const branchX = flower.x + Math.cos(angle) * branchLength;
    const branchY = flower.y + 200 * flower.scale + Math.sin(angle) * branchLength;

    ctx.beginPath();
    ctx.moveTo(flower.x, flower.y + 200 * flower.scale); // Start from the base of the stalk
    ctx.lineTo(branchX, branchY); // Draw to the branch end
    ctx.lineWidth = 10 * flower.scale;
    ctx.strokeStyle = 'green';
    ctx.stroke();

    // Draw a flower at the branch's end
    drawFlower(branchX, branchY, flower.scale * 0.7); // Smaller flower on the branch
  }
}

// Function to draw everything together
window.drawScene = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    
    // Draw the flower, stalk, and branches
    drawFlower(flower.x, flower.y, flower.scale);  // Main flower
    drawStalk();  // Stalk of the flower
    //drawBranches();  // Branches with flowers
}

// Handle mouse dragging to move the flower
canvas.addEventListener('mousedown', (e) => {
  flower.isDragging = true;
  flower.offsetX = e.offsetX - flower.x;
  flower.offsetY = e.offsetY - flower.y;
});

canvas.addEventListener('mousemove', (e) => {
  if (flower.isDragging) {
    flower.x = e.offsetX - flower.offsetX;
    flower.y = e.offsetY - flower.offsetY;
    drawScene(); // Redraw everything
  }
});

canvas.addEventListener('mouseup', () => flower.isDragging = false);
canvas.addEventListener('mouseleave', () => flower.isDragging = false);

// Handle zooming in and out with the mouse wheel
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const zoomFactor = 1.1;
  flower.scale *= e.deltaY < 0 ? zoomFactor : 1 / zoomFactor;
  drawScene(); // Redraw everything
});

// Initial drawing
drawScene();

//create a second flower it should be different from the first one with the functions from id flowerCanvas2
const canvas2 = document.getElementById('flowerCanvas2');
const ctx2 = canvas2.getContext('2d');

canvas2.width = 600;
canvas2.height = 600;

let flower2 = { 
    x: canvas2.width / 2,
    y: canvas2.height / 2,
    scale: 1,
    isDragging: false,
    offsetX: 0,
    offsetY: 0
    };
// Draw a simple random color function
function randomColor2() {
    return `hsl(${Math.random() * 360}, 70%, 60%)`;
}
// Function to draw a flower
function drawFlower2(x, y, scale = 1) {
    const petalCount = 6;
    const petalLength = 80 * scale;
    const petalWidth = 30 * scale;

    // Draw petals
    for (let i = 0; i < petalCount; i++) {
        const angle = (i * Math.PI * 2) / petalCount;
        ctx2.beginPath();
        ctx2.ellipse(
            x + Math.cos(angle) * 100 * scale,
            y + Math.sin(angle) * 100 * scale,
            petalLength,
            petalWidth,
            angle,
            0,
            Math.PI * 2
        );
        ctx2.fillStyle = randomColor2();
        ctx2.fill();
    }

    // Draw flower center
    ctx2.beginPath();
    ctx2.arc(x, y, 40 * scale, 0, Math.PI * 2);
    ctx2.fillStyle = randomColor2();
    ctx2.fill();
}

// Function to draw the stalk
function drawStalk2() {
    ctx2.beginPath();
    ctx2.moveTo(flower2.x, flower2.y + 40 * flower2.scale); // Start at the bottom of the flower
    ctx2.lineTo(flower2.x, flower2.y + 200 * flower2.scale); // Draw the stalk downwards
    ctx2.lineWidth = 10 * flower2.scale;
    ctx2.strokeStyle = 'green';
    ctx2.stroke();
}
// Function to draw branches
function drawBranches2() {
    const branchCount = 2;
    const branchLength = 80 * flower2.scale;

    // Draw branches sprouting from the stalk
    for (let i = 0; i < branchCount; i++) {
        const angle = (Math.PI / 2) * (i === 0 ? 1 : -1); // Branch angles
        const branchX = flower2.x + Math.cos(angle) * branchLength;
        const branchY = flower2.y + 200 * flower2.scale + Math.sin(angle) * branchLength;

        ctx2.beginPath();
        ctx2.moveTo(flower2.x, flower2.y + 200 * flower2.scale); // Start from the base of the stalk
        ctx2.lineTo(branchX, branchY); // Draw to the branch end
        ctx2.lineWidth = 10 * flower2.scale;
        ctx2.strokeStyle = 'green';
        ctx2.stroke();

        // Draw a flower at the branch's end
        drawFlower2(branchX, branchY, flower2.scale * 0.7); // Smaller flower on the branch
    }
}

// Function to draw everything together
window.drawScene2 = function() {
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height); // Clear the canvas
    
    // Draw the flower, stalk, and branches
    drawFlower2(flower2.x, flower2.y, flower2.scale);  // Main flower
    drawStalk2();  // Stalk of the flower
    //drawBranches2();  // Branches with flowers
}

// Handle mouse dragging to move the flower
canvas2.addEventListener('mousedown', (e) => {
    flower2.isDragging = true;
    flower2.offsetX = e.offsetX - flower2.x;
    flower2.offsetY = e.offsetY - flower2.y;
});

canvas2.addEventListener('mousemove', (e) => {
    if (flower2.isDragging) {
        flower2.x = e.offsetX - flower2.offsetX;
        flower2.y = e.offsetY - flower2.offsetY;
        drawScene2(); // Redraw everything
    }
});

canvas2.addEventListener('mouseup', () => flower2.isDragging = false);
canvas2.addEventListener('mouseleave', () => flower2.isDragging = false);
// Handle zooming in and out with the mouse wheel
canvas2.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    flower2.scale *= e.deltaY < 0 ? zoomFactor : 1 / zoomFactor;
    drawScene2(); // Redraw everything
});
// Initial drawing
drawScene2();


//create 4 more flowers with the same functions as above
const canvas3 = document.getElementById('flowerCanvas3');
const ctx3 = canvas3.getContext('2d');
canvas3.width = 600;
canvas3.height = 600;
let flower3 = { 
    x: canvas3.width / 2,
    y: canvas3.height / 2,
    scale: 1,
    isDragging: false,
    offsetX: 0,
    offsetY: 0
    };

// Draw a simple random color function
function randomColor3() {
    return `hsl(${Math.random() * 360}, 70%, 60%)`;
}
// Function to draw a flower
function drawFlower3(x, y, scale = 1) {
    const petalCount = 6;
    const petalLength = 80 * scale;
    const petalWidth = 30 * scale;

    // Draw petals
    for (let i = 0; i < petalCount; i++) {
        const angle = (i * Math.PI * 2) / petalCount;
        ctx3.beginPath();
        ctx3.ellipse(
            x + Math.cos(angle) * 100 * scale,
            y + Math.sin(angle) * 100 * scale,
            petalLength,
            petalWidth,
            angle,
            0,
            Math.PI * 2
        );
        ctx3.fillStyle = randomColor3();
        ctx3.fill();
    }

    // Draw flower center
    ctx3.beginPath();
    ctx3.arc(x, y, 40 * scale, 0, Math.PI * 2);
    ctx3.fillStyle = randomColor3();
    ctx3.fill();
}
// Function to draw the stalk
function drawStalk3() {
    ctx3.beginPath();
    ctx3.moveTo(flower3.x, flower3.y + 40 * flower3.scale); // Start at the bottom of the flower
    ctx3.lineTo(flower3.x, flower3.y + 200 * flower3.scale); // Draw the stalk downwards
    ctx3.lineWidth = 10 * flower3.scale;
    ctx3.strokeStyle = 'green';
    ctx3.stroke();
}
// Function to draw branches
function drawBranches3() {
    const branchCount = 2;
    const branchLength = 80 * flower3.scale;

    // Draw branches sprouting from the stalk
    for (let i = 0; i < branchCount; i++) {
        const angle = (Math.PI / 2) * (i === 0 ? 1 : -1); // Branch angles
        const branchX = flower3.x + Math.cos(angle) * branchLength;
        const branchY = flower3.y + 200 * flower3.scale + Math.sin(angle) * branchLength;

        ctx3.beginPath();
        ctx3.moveTo(flower3.x, flower3.y + 200 * flower3.scale); // Start from the base of the stalk
        ctx3.lineTo(branchX, branchY); // Draw to the branch end
        ctx3.lineWidth = 10 * flower3.scale;
        ctx3.strokeStyle = 'green';
        ctx3.stroke();

        // Draw a flower at the branch's end
        drawFlower3(branchX, branchY, flower3.scale * 0.7); // Smaller flower on the branch
    }
}
// Function to draw everything together
window.drawScene3 = function() {
    ctx3.clearRect(0, 0, canvas3.width, canvas3.height); // Clear the canvas
    
    // Draw the flower, stalk, and branches
    drawFlower3(flower3.x, flower3.y, flower3.scale);  // Main flower
    drawStalk3();  // Stalk of the flower
    //drawBranches3();  // Branches with flowers
}
// Handle mouse dragging to move the flower
canvas3.addEventListener('mousedown', (e) => {
    flower3.isDragging = true;
    flower3.offsetX = e.offsetX - flower3.x;
    flower3.offsetY = e.offsetY - flower3.y;
});
canvas3.addEventListener('mousemove', (e) => {
    if (flower3.isDragging) {
        flower3.x = e.offsetX - flower3.offsetX;
        flower3.y = e.offsetY - flower3.offsetY;
        drawScene3(); // Redraw everything
    }
});
canvas3.addEventListener('mouseup', () => flower3.isDragging = false);
canvas3.addEventListener('mouseleave', () => flower3.isDragging = false);
// Handle zooming in and out with the mouse wheel
canvas3.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    flower3.scale *= e.deltaY < 0 ? zoomFactor : 1 / zoomFactor;
    drawScene3(); // Redraw everything
});
// Initial drawing
drawScene3();

//create 4 more flowers with the same functions as above
const canvas4 = document.getElementById('flowerCanvas4');
const ctx4 = canvas4.getContext('2d');
canvas4.width = 600;
canvas4.height = 600;
let flower4 = { 
    x: canvas4.width / 2,
    y: canvas4.height / 2,
    scale: 1,
    isDragging: false,
    offsetX: 0,
    offsetY: 0
    };
// Draw a simple random color function
function randomColor4() {
    return `hsl(${Math.random() * 360}, 70%, 60%)`;
}
// Function to draw a flower
function drawFlower4(x, y, scale = 1) {
    const petalCount = 6;
    const petalLength = 80 * scale;
    const petalWidth = 30 * scale;

    // Draw petals
    for (let i = 0; i < petalCount; i++) {
        const angle = (i * Math.PI * 2) / petalCount;
        ctx4.beginPath();
        ctx4.ellipse(
            x + Math.cos(angle) * 100 * scale,
            y + Math.sin(angle) * 100 * scale,
            petalLength,
            petalWidth,
            angle,
            0,
            Math.PI * 2
        );
        ctx4.fillStyle = randomColor4();
        ctx4.fill();
    }

    // Draw flower center
    ctx4.beginPath();
    ctx4.arc(x, y, 40 * scale, 0, Math.PI * 2);
    ctx4.fillStyle = randomColor4();
    ctx4.fill();
}   
// Function to draw the stalk
function drawStalk4() {
    ctx4.beginPath();
    ctx4.moveTo(flower4.x, flower4.y + 40 * flower4.scale); // Start at the bottom of the flower
    ctx4.lineTo(flower4.x, flower4.y + 200 * flower4.scale); // Draw the stalk downwards
    ctx4.lineWidth = 10 * flower4.scale;
    ctx4.strokeStyle = 'green';
    ctx4.stroke();
}
// Function to draw branches

function drawBranches4() {
    const branchCount = 2;
    const branchLength = 80 * flower4.scale;

    // Draw branches sprouting from the stalk
    for (let i = 0; i < branchCount; i++) {
        const angle = (Math.PI / 2) * (i === 0 ? 1 : -1); // Branch angles
        const branchX = flower4.x + Math.cos(angle) * branchLength;
        const branchY = flower4.y + 200 * flower4.scale + Math.sin(angle) * branchLength;

        ctx4.beginPath();
        ctx4.moveTo(flower4.x, flower4.y + 200 * flower4.scale); // Start from the base of the stalk
        ctx4.lineTo(branchX, branchY); // Draw to the branch end
        ctx4.lineWidth = 10 * flower4.scale;
        ctx4.strokeStyle = 'green';
        ctx4.stroke();

        // Draw a flower at the branch's end
        drawFlower4(branchX, branchY, flower4.scale * 0.7); // Smaller flower on the branch
    }
}
// Function to draw everything together
window.drawScene4 = function() {
    ctx4.clearRect(0, 0, canvas4.width, canvas4.height); // Clear the canvas
    
    // Draw the flower, stalk, and branches
    drawFlower4(flower4.x, flower4.y, flower4.scale);  // Main flower
    drawStalk4();  // Stalk of the flower
    //drawBranches4();  // Branches with flowers
}
// Handle mouse dragging to move the flower
canvas4.addEventListener('mousedown', (e) => {
    flower4.isDragging = true;
    flower4.offsetX = e.offsetX - flower4.x;
    flower4.offsetY = e.offsetY - flower4.y;
});
canvas4.addEventListener('mousemove', (e) => {
    if (flower4.isDragging) {
        flower4.x = e.offsetX - flower4.offsetX;
        flower4.y = e.offsetY - flower4.offsetY;
        drawScene4(); // Redraw everything
    }
});
canvas4.addEventListener('mouseup', () => flower4.isDragging = false);
canvas4.addEventListener('mouseleave', () => flower4.isDragging = false);
// Handle zooming in and out with the mouse wheel
canvas4.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    flower4.scale *= e.deltaY < 0 ? zoomFactor : 1 / zoomFactor;
    drawScene4(); // Redraw everything
});
// Initial drawing
drawScene4();

//create 4 more flowers with the same functions as above
const canvas5 = document.getElementById('flowerCanvas5');
const ctx5 = canvas5.getContext('2d');
canvas5.width = 600;
canvas5.height = 600;
let flower5 = { 
    x: canvas5.width / 2,
    y: canvas5.height / 2,
    scale: 1,
    isDragging: false,
    offsetX: 0,
    offsetY: 0
    };
// Draw a simple random color function
function randomColor5() {
    return `hsl(${Math.random() * 360}, 70%, 60%)`;
}
// Function to draw a flower
function drawFlower5(x, y, scale = 1) {
    const petalCount = 6;
    const petalLength = 80 * scale;
    const petalWidth = 30 * scale;

    // Draw petals
    for (let i = 0; i < petalCount; i++) {
        const angle = (i * Math.PI * 2) / petalCount;
        ctx5.beginPath();
        ctx5.ellipse(
            x + Math.cos(angle) * 100 * scale,
            y + Math.sin(angle) * 100 * scale,
            petalLength,
            petalWidth,
            angle,
            0,
            Math.PI * 2
        );
        ctx5.fillStyle = randomColor5();
        ctx5.fill();
    }

    // Draw flower center
    ctx5.beginPath();
    ctx5.arc(x, y, 40 * scale, 0, Math.PI * 2);
    ctx5.fillStyle = randomColor5();
    ctx5.fill();
}
// Function to draw the stalk
function drawStalk5() {
    ctx5.beginPath();
    ctx5.moveTo(flower5.x, flower5.y + 40 * flower5.scale); // Start at the bottom of the flower
    ctx5.lineTo(flower5.x, flower5.y + 200 * flower5.scale); // Draw the stalk downwards
    ctx5.lineWidth = 10 * flower5.scale;
    ctx5.strokeStyle = 'green';
    ctx5.stroke();
}
// Function to draw branches
function drawBranches5() {
    const branchCount = 2;
    const branchLength = 80 * flower5.scale;

    // Draw branches sprouting from the stalk
    for (let i = 0; i < branchCount; i++) {
        const angle = (Math.PI / 2) * (i === 0 ? 1 : -1); // Branch angles
        const branchX = flower5.x + Math.cos(angle) * branchLength;
        const branchY = flower5.y + 200 * flower5.scale + Math.sin(angle) * branchLength;

        ctx5.beginPath();
        ctx5.moveTo(flower5.x, flower5.y + 200 * flower5.scale); // Start from the base of the stalk
        ctx5.lineTo(branchX, branchY); // Draw to the branch end
        ctx5.lineWidth = 10 * flower5.scale;
        ctx5.strokeStyle = 'green';
        ctx5.stroke();

        // Draw a flower at the branch's end
        drawFlower5(branchX, branchY, flower5.scale * 0.7); // Smaller flower on the branch
    }
}
// Function to draw everything together
window.drawScene5 = function() {
    ctx5.clearRect(0, 0, canvas5.width, canvas5.height); // Clear the canvas
    
    // Draw the flower, stalk, and branches
    drawFlower5(flower5.x, flower5.y, flower5.scale);  // Main flower
    drawStalk5();  // Stalk of the flower
    //drawBranches5();  // Branches with flowers
}
// Handle mouse dragging to move the flower
canvas5.addEventListener('mousedown', (e) => {
    flower5.isDragging = true;
    flower5.offsetX = e.offsetX - flower5.x;
    flower5.offsetY = e.offsetY - flower5.y;
});
canvas5.addEventListener('mousemove', (e) => {
    if (flower5.isDragging) {
        flower5.x = e.offsetX - flower5.offsetX;
        flower5.y = e.offsetY - flower5.offsetY;
        drawScene5(); // Redraw everything
    }
});
canvas5.addEventListener('mouseup', () => flower5.isDragging = false);
canvas5.addEventListener('mouseleave', () => flower5.isDragging = false);
// Handle zooming in and out with the mouse wheel
canvas5.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    flower5.scale *= e.deltaY < 0 ? zoomFactor : 1 / zoomFactor;
    drawScene5(); // Redraw everything
});
// Initial drawing
drawScene5();
//create 4 more flowers with the same functions as above
const canvas6 = document.getElementById('flowerCanvas6');
const ctx6 = canvas6.getContext('2d');
canvas6.width = 600;
canvas6.height = 600;
let flower6 = { 
    x: canvas6.width / 2,
    y: canvas6.height / 2,
    scale: 1,
    isDragging: false,
    offsetX: 0,
    offsetY: 0
    };
// Draw a simple random color function
function randomColor6() {
    return `hsl(${Math.random() * 360}, 70%, 60%)`;
}
// Function to draw a flower
function drawFlower6(x, y, scale = 1) {
    const petalCount = 6;
    const petalLength = 80 * scale;
    const petalWidth = 30 * scale;

    // Draw petals
    for (let i = 0; i < petalCount; i++) {
        const angle = (i * Math.PI * 2) / petalCount;
        ctx6.beginPath();
        ctx6.ellipse(
            x + Math.cos(angle) * 100 * scale,
            y + Math.sin(angle) * 100 * scale,
            petalLength,
            petalWidth,
            angle,
            0,
            Math.PI * 2
        );
        ctx6.fillStyle = randomColor6();
        ctx6.fill();
    }

    // Draw flower center
    ctx6.beginPath();
    ctx6.arc(x, y, 40 * scale, 0, Math.PI * 2);
    ctx6.fillStyle = randomColor6();
    ctx6.fill();
}
// Function to draw the stalk
function drawStalk6() {
    ctx6.beginPath();
    ctx6.moveTo(flower6.x, flower6.y + 40 * flower6.scale); // Start at the bottom of the flower
    ctx6.lineTo(flower6.x, flower6.y + 200 * flower6.scale); // Draw the stalk downwards
    ctx6.lineWidth = 10 * flower6.scale;
    ctx6.strokeStyle = 'green';
    ctx6.stroke();
}
// Function to draw branches
function drawBranches6() {
    const branchCount = 2;
    const branchLength = 80 * flower6.scale;

    // Draw branches sprouting from the stalk
    for (let i = 0; i < branchCount; i++) {
        const angle = (Math.PI / 2) * (i === 0 ? 1 : -1); // Branch angles
        const branchX = flower6.x + Math.cos(angle) * branchLength;
        const branchY = flower6.y + 200 * flower6.scale + Math.sin(angle) * branchLength;

        ctx6.beginPath();
        ctx6.moveTo(flower6.x, flower6.y + 200 * flower6.scale); // Start from the base of the stalk
        ctx6.lineTo(branchX, branchY); // Draw to the branch end
        ctx6.lineWidth = 10 * flower6.scale;
        ctx6.strokeStyle = 'green';
        ctx6.stroke();

        // Draw a flower at the branch's end
        drawFlower6(branchX, branchY, flower6.scale * 0.7); // Smaller flower on the branch
    }
}
// Function to draw everything together
window.drawScene6 = function() {
    ctx6.clearRect(0, 0, canvas6.width, canvas6.height); // Clear the canvas
    
    // Draw the flower, stalk, and branches
    drawFlower6(flower6.x, flower6.y, flower6.scale);  // Main flower
    drawStalk6();  // Stalk of the flower
    //drawBranches6();  // Branches with flowers
}
// Handle mouse dragging to move the flower
canvas6.addEventListener('mousedown', (e) => {
    flower6.isDragging = true;
    flower6.offsetX = e.offsetX - flower6.x;
    flower6.offsetY = e.offsetY - flower6.y;
});
canvas6.addEventListener('mousemove', (e) => {
    if (flower6.isDragging) {
        flower6.x = e.offsetX - flower6.offsetX;
        flower6.y = e.offsetY - flower6.offsetY;
        drawScene6(); // Redraw everything
    }
});
canvas6.addEventListener('mouseup', () => flower6.isDragging = false);
canvas6.addEventListener('mouseleave', () => flower6.isDragging = false);
// Handle zooming in and out with the mouse wheel
canvas6.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    flower6.scale *= e.deltaY < 0 ? zoomFactor : 1 / zoomFactor;
    drawScene6(); // Redraw everything
});
// Initial drawing
drawScene6();

