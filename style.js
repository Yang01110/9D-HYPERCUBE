* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    overflow: hidden;
    background: #020000;
    color: white;
    font-family: Arial, sans-serif;
}

#canvas-container {
    position: fixed;
    inset: 0;
}

canvas {
    display: block;
}

.panel {
    position: fixed;
    top: 25px;
    left: 25px;
    width: 270px;
    padding: 22px;
    background: rgba(20, 0, 0, 0.82);
    border: 1px solid rgba(255, 20, 20, 0.65);
    border-radius: 12px;
    backdrop-filter: blur(12px);
    box-shadow: 0 0 25px rgba(255, 0, 0, 0.2);
    z-index: 10;
}

h1 {
    font-size: 19px;
    color: #ff2525;
    letter-spacing: 2px;
    margin-bottom: 7px;
}

.subtitle {
    color: #999;
    font-size: 11px;
    margin-bottom: 22px;
    letter-spacing: 1px;
}

.stat {
    font-size: 12px;
    color: #bbb;
    margin: 12px 0;
}

.stat span {
    color: #ff3333;
    float: right;
}

.control {
    margin-top: 22px;
}

.control label {
    display: block;
    font-size: 12px;
    color: #ddd;
    margin-bottom: 10px;
}

input[type="range"] {
    width: 100%;
    accent-color: #ff1717;
    cursor: pointer;
}

button {
    background: #160000;
    color: #ff3333;
    border: 1px solid #b50000;
    padding: 11px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: 0.25s;
    font-size: 12px;
}

button:hover {
    background: #b00000;
    color: white;
    box-shadow: 0 0 15px red;
}

.buttons {
    display: flex;
    gap: 8px;
    margin-top: 20px;
}

.buttons button {
    flex: 1;
}

.footer {
    position: fixed;
    bottom: 22px;
    right: 25px;
    color: #ff3333;
    font-size: 10px;
    letter-spacing: 2px;
    opacity: 0.65;
}

@media(max-width: 600px) {
    .panel {
        top: 12px;
        left: 12px;
        width: 220px;
        padding: 15px;
    }
}
