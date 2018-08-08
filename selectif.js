var sourceInput = document.querySelector('.option[type="photo-upload"] input')
var sourceImage = document.querySelector('img#source-image')
var sourceCanvas = document.querySelector('canvas#source')
var resultCanvas = document.querySelector('canvas#result')
var sourceCtx = sourceCanvas.getContext('2d')
var resultCtx = resultCanvas.getContext('2d')

sourceImage.addEventListener('load', () => {
    initSource()
    initResult()
    drawResult()
})

sourceInput.addEventListener('change', e => {
    console.log(e)
    if (sourceInput.files && sourceInput.files[0]) {
        var reader = new FileReader()
        reader.onload = function(e) {
            sourceImage.src = e.target.result
        }
        reader.readAsDataURL(sourceInput.files[0])
      }
})

// resize source canvas to source dimensions
function initSource(){
    sourceCanvas.width = sourceImage.naturalWidth
    sourceCanvas.height = sourceImage.naturalHeight
    drawSource()
}

// resize result canvas based on settings
function initResult(){
    resultCanvas.width = model.count * model.size
    const countY = Math.round(sourceCanvas.height / sourceCanvas.width * model.count)
    resultCanvas.height = countY * model.size
}

function getRects(){
    const countX = model.count
    const countY = Math.round(sourceCanvas.height / sourceCanvas.width * countX)
    const spacing = sourceCanvas.width / countX
    const offsetX = (sourceCanvas.width / countX) / 2 - model.size / 2
    const offsetY = (sourceCanvas.height / countY) / 2 - model.size / 2
    return Array(countX * countY).fill(0).map((z, i) => {
        const x = i % countX
        const y = Math.floor(i / countX)
        return [x * spacing + offsetX, y * spacing + offsetY, model.size, model.size]
    })
}

function drawSource(){
    sourceCtx.drawImage(sourceImage, 0, 0)
    sourceCtx.lineWidth = .5
    sourceCtx.strokeStyle = 'red'
    getRects().forEach(rect => {
        sourceCtx.beginPath()
        sourceCtx.rect(...rect)
        sourceCtx.stroke()
    })
}

function drawResult(){
    getRects().forEach((rect, i) => {
        const x = i % model.count * model.size
        const y = Math.floor(i / model.count) * model.size
        resultCtx.drawImage(sourceImage, ...rect, x, y, model.size, model.size)
    })
}

const model = {
    size: 29,
    count: 10
}
const gui = new dat.GUI()
const size = gui.add(model, 'size', 2, 200).step(1).listen()
const count = gui.add(model, 'count', 2, 50).step(1).listen()

size.onChange((val) => {
    initResult()
    drawSource()
    drawResult()
})

count.onChange((val) => {
    initResult()
    drawSource()
    drawResult()
})

document.querySelectorAll('.option[type="image"]').forEach(el => {
    el.addEventListener('click', () => {
        model.size = parseInt(el.getAttribute('size'))
        model.count = parseInt(el.getAttribute('count'))
        console.log(model)
        sourceImage.src = el.childNodes[0].src
    })
})