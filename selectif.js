/*

    TODO
    - webgl shader
    - video recorder

*/

var sourceInput = document.querySelector('.option[type="photo-upload"] input')
var sourceImage = document.querySelector('img#source-image')
var drawable = sourceImage
var sourceCanvas = document.querySelector('canvas#source')
var resultCanvas = document.querySelector('canvas#result')
var sourceCtx = sourceCanvas.getContext('2d')
var resultCtx = resultCanvas.getContext('2d')
var video = document.querySelector('video')

sourceInput.addEventListener('change', e => {
    if (sourceInput.files && sourceInput.files[0]) {
        drawable = sourceImage
        var reader = new FileReader()
        reader.onload = function(e) {
            sourceImage.src = e.target.result
        }
        reader.readAsDataURL(sourceInput.files[0])
    }
})

sourceImage.addEventListener('load', () => {
    initSource()
    update()
})

// resize source canvas to source dimensions
function initSource(){
    if(drawable === sourceImage){
        sourceCanvas.width = sourceImage.naturalWidth
        sourceCanvas.height = sourceImage.naturalHeight
    }else{
        sourceCanvas.width = video.videoWidth
        sourceCanvas.height = video.videoHeight
    }
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
    const offsetX = (sourceCanvas.width / countX) / 2 - model.size / 2 + model.offsetX / 100 * sourceCanvas.width / countX
    const offsetY = (sourceCanvas.height / countY) / 2 - model.size / 2 + model.offsetY / 100 * sourceCanvas.height / countY
    return Array(countX * countY).fill(0).map((z, i) => {
        const x = i % countX
        const y = Math.floor(i / countX)
        return [x * spacing + offsetX, y * spacing + offsetY, model.size, model.size]
    })
}

function drawSource(){
    sourceCtx.drawImage(drawable, 0, 0)
    sourceCtx.lineWidth = .5
    sourceCtx.strokeStyle = 'red'
    rects.forEach(rect => {
        sourceCtx.beginPath()
        sourceCtx.rect(...rect)
        sourceCtx.stroke()
    })
}

function drawResult(){
    rects.forEach((rect, i) => {
        const x = i % model.count * model.size
        const y = Math.floor(i / model.count) * model.size
        resultCtx.drawImage(drawable, ...rect, x, y, model.size, model.size)
    })
}

function snapShot(){
    const image = resultCanvas.toDataURL('image/png').replace('image/png', 'image/octet-stream')
    const a = document.createElement('a')
    a.setAttribute('download', 'selectif-snapshot.png')
    a.href = image
    a.click()
}

const model = {
    size: 29,
    count: 10,
    offsetX: 0, 
    offsetY: 0
}
var rects = getRects()
const gui = new dat.GUI()
const size = gui.add(model, 'size', 2, 300).step(1).listen()
const count = gui.add(model, 'count', 2, 50).step(1).listen()
const offsetX = gui.add(model, 'offsetX', -100, 100).step(1).listen()
const offsetY = gui.add(model, 'offsetY', -100, 100).step(1).listen()
const btn = gui.add({snapshot: snapShot}, 'snapshot').listen()

const update = function(){
    rects = getRects()
    initResult()
    drawSource()
    drawResult()
}

size.onChange(update)
count.onChange(update)
offsetX.onChange(update)
offsetY.onChange(update)

// preset source selector
document.querySelectorAll('.option[type="image"]').forEach(el => {
    el.addEventListener('click', () => {
        deactivateWebcam()
        drawable = sourceImage
        model.size = parseInt(el.getAttribute('size'))
        model.count = parseInt(el.getAttribute('count'))
        sourceImage.src = el.childNodes[0].src
    })
})

var constraints = { audio: false, video: { width: 1280, height: 720 } }
var activateWebcam = () => {

    return new Promise((resolve, reject) => {
        navigator.mediaDevices.getUserMedia(constraints)
            .then(mediaStream => {
                drawable = video
                video.srcObject = mediaStream
                video.onloadedmetadata = e => {
                    document.body.classList.add('webcam')
                    initSource()
                    update()
                    video.play()
                    resolve()
                }
            }).catch(e => reject(e))
    })
}
var deactivateWebcam = () => {
    video.pause()
    document.body.classList.remove('webcam')
}

var onFrame = () => {
    if(video.paused) return
    requestAnimationFrame(onFrame)
    drawSource()
    drawResult()
}
video.addEventListener('play', onFrame)

document.querySelector('.option[type="webcam"]').addEventListener('click', () => {
    activateWebcam()
})
