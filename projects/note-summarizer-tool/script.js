const input = document.getElementById("inputText")
const summaryBox = document.getElementById("summary")
const mode = document.getElementById("mode")

const readingTime = document.getElementById("readingTime")
const keywords = document.getElementById("keywords")

document.getElementById("summarize").onclick = () => {

let text = input.value
let sentences = text.split(". ")

let length = 2

if(mode.value === "medium") length = 4
if(mode.value === "long") length = 6

let summary = sentences.slice(0,length).join(". ")

summaryBox.value = summary

// reading time
let words = text.split(" ").length
let minutes = Math.ceil(words/200)

readingTime.textContent = "Reading Time: "+minutes+" min"

// keyword extraction
let freq = {}
text.toLowerCase().split(/\W+/).forEach(word=>{
if(word.length>4){
freq[word] = (freq[word]||0)+1
}
})

let top = Object.entries(freq)
.sort((a,b)=>b[1]-a[1])
.slice(0,5)
.map(x=>x[0])

keywords.textContent = "Keywords: "+top.join(", ")

}

document.getElementById("copy").onclick = () => {

summaryBox.select()
document.execCommand("copy")

}