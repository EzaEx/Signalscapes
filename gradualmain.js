function newCyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
}

function newSfc32(a, b, c, d) {
    return function() {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
      var t = (a + b) | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      d = d + 1 | 0;
      t = t + d | 0;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    }
}

var scaleMult = 2;
if (isFxpreview) scaleMult = 4.096;

function genCanv(download = false) {

    let rand = newSfc32(...newCyrb128("trsust"))
    let random = (a, b) => {return rand() * (b-a) + a}

    const waveComponents = []
    let cNum = random(50, 200)


    let fLim = random(7, 90)
    for (let i = 1; i <= cNum; i += 1) {
        let f = (i/cNum) * (1/random(fLim, 60))
        waveComponents.push({
            frequency: f,
            magnitude: random(1, fLim - fLim*20/90),
            offset: random(0, 1000),
        })
    }

    const waveFunc = (x) => { 
        let y = 0;
        waveComponents.forEach((c) => {
            y += c.magnitude * Math.sin(x * c.frequency + c.offset)
        })
        return y
    }


    let canvas = document.getElementById("mainCanvas")
    let ctx = canvas.getContext("2d")

    canvas.width = 1000 * scaleMult
    canvas.height = 1000 * scaleMult

    let property_palette = "blank"

    let colChoice = random(0, 1)
    if(colChoice < 0.7) {
        ctx.fillStyle = "rgb(240, 240, 240)"
        if(colChoice < 0.61) {
            ctx.strokeStyle = `rgba(10, 10, 10, ${0.01 * scaleMult})`;
            property_palette = "regular"
        }
        else {
            ctx.strokeStyle = `rgba(100, 10, 10, ${0.01 * scaleMult})`;
            property_palette = "sunset"
        }
    }
    else {
        ctx.fillStyle = "rgb(10, 10, 10)"
        if(colChoice < 0.97) {
            ctx.strokeStyle = `rgba(240, 240, 240, ${0.01 * scaleMult})`;
            property_palette = "inverse"
        }
        else {
            ctx.strokeStyle = `rgba(230, 170, 10, ${0.01 * scaleMult})`;
            property_palette = "golden"
        }
    }

    ctx.fillRect(0, 0, canvas.width, canvas.height);


    let modeChoice = random(0, 1);
    let property_style = "blank";

    if (modeChoice < 0.4) {
        mode = 0;
        property_style = "dune";
    } 
    else if (modeChoice < 0.525) {
        mode = 1; 
        property_style = "stack";
    }
    else if (modeChoice < 0.65) {
        mode = 2; 
        property_style = "stack";
    }
    else if (modeChoice < 0.775) {
        mode = 3; 
        property_style = "descend";
    }
    else if (modeChoice < 0.9) {
        mode = 4; 
        property_style = "ascend";
    }
    else {
        mode = 5;
        property_style = "canopy";
    } 

    let property_fractured = false;
    let fractured = false;
    if (random(0, 1) < 0.05) {
        fractured = true;
        property_fractured = true;
    }


    let pi = 1000 * scaleMult
    let ph = waveFunc(pi / scaleMult) + 500 * scaleMult

    let i = 1000 * scaleMult
    const loop = () => {


        for (let j = 0; j < 10; j++) {

            i -= 0.01 * scaleMult
            if(i <= 0) return;
            
            let h = waveFunc(i / scaleMult) * scaleMult + 500 * scaleMult
            let m = (h - ph) / (i - pi)

            if (fractured) m = -1/m

            ctx.beginPath()
            
            switch(mode){
                case 0: //dune
                    ctx.moveTo(h, i)
                    ctx.lineTo(h + m * (-2000* scaleMult), -(i-2000 * scaleMult))
                    break;
                case 1: //left-stack
                    ctx.moveTo(i, h)
                    ctx.lineTo((i-2000 * scaleMult), h + m * (-2000* scaleMult))
                    break;
                case 2: //right-stack
                    ctx.moveTo(i, h)
                    ctx.lineTo((i+2000 * scaleMult), h + m * (+2000* scaleMult))
                    break;
                case 3: //descending
                    ctx.moveTo(i, h)
                    ctx.lineTo( h + m * (2000* scaleMult), (i-2000 * scaleMult),)
                    break;
                case 4: //ascending
                    ctx.moveTo(i, h)
                    ctx.lineTo( h + m * (2000* scaleMult), -(i-2000 * scaleMult),)
                    break;
                case 5: //canopy
                    ctx.moveTo(h - m * (2000* scaleMult), (i-2000 * scaleMult))
                    ctx.lineTo(i, h)
                    m = 0
                    ctx.lineTo( h + m * (2000* scaleMult), (i+2000 * scaleMult),)
                break;
            }

            ctx.stroke()

            pi = i; ph = h
        }

        setTimeout(loop, 0);
       
    }

    setTimeout(loop, 0);

    window.$fxhashFeatures = {
        "Palette": property_palette,
        "Style": property_style,
        "Fractured": property_fractured
    }


    if (download) {
        var link = document.createElement('a');
        link.download = 'signalscape.png';
        link.href = canvas.toDataURL();
        link.click();
    }
}

genCanv();
fxpreview();


document.addEventListener("keydown", (e) => {
    if(e.key == "1" || e.key == "2" || e.key == "3" || 
    e.key == "4" || e.key == "5" || e.key == "6" || 
    e.key == "7" || e.key == "8" || e.key == "9") {
        let mult = parseInt(e.key, 10);
        scaleMult = mult;
        genCanv(true);
    }
});