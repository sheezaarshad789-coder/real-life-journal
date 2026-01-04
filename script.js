// DARK MODE TOGGLE
const toggle=document.getElementById('theme-toggle');
toggle.addEventListener('click',()=>{document.body.classList.toggle('dark-mode'); toggle.textContent=document.body.classList.contains('dark-mode')?'☀️':'🌙';});

// SKILL TABS
const skills=['coding','writing','design','personal'];
let currentSkill='coding';
const sections=['learned','mistakes','wins','questions','reflections'];

document.querySelectorAll('.tab-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
        document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        currentSkill=btn.dataset.skill;
        loadSkillEntries(currentSkill);
        updateCharts();
        btn.scrollIntoView({behavior:'smooth',inline:'center'});
    });
});

// LOCALSTORAGE LOAD
window.onload=()=>{
    skills.forEach(skill=>{
        sections.forEach(section=>{
            const data=JSON.parse(localStorage.getItem(`${skill}_${section}`))||[];
            if(skill===currentSkill) data.forEach(item=>addToUI(section,item));
        });
    });

}

// HELPER FUNCTIONS
function sectionMap(section){return {learned:'todayLearned',mistakes:'mistakesList',wins:'winsList',questions:'questionsList',reflections:'reflectionList'}[section];}
function addToUI(section,text){const container=document.getElementById(sectionMap(section)); const div=document.createElement('div'); div.textContent=text; container.appendChild(div);}
function saveEntry(section,inputId){const text=document.getElementById(inputId).value.trim(); if(!text) return; addToUI(section,text); const key=`${currentSkill}_${section}`; const data=JSON.parse(localStorage.getItem(key))||[]; data.push(text); localStorage.setItem(key,JSON.stringify(data)); document.getElementById(inputId).value='';}
document.getElementById('saveLearn').addEventListener('click',()=>saveEntry('learned','learnInput'));
document.getElementById('saveMistake').addEventListener('click',()=>saveEntry('mistakes','mistakeInput'));
document.getElementById('saveWin').addEventListener('click',()=>saveEntry('wins','winInput'));
document.getElementById('saveQuestion').addEventListener('click',()=>saveEntry('questions','questionInput'));
document.getElementById('saveReflection').addEventListener('click',()=>saveEntry('reflections','reflectionInput'));

// MOOD & TIME TRACKER + INTERACTIVE CHARTS
let moodChartInstance=null,timeChartInstance=null;

function updateCharts(){
    const trackerData=JSON.parse(localStorage.getItem(`${currentSkill}_tracker`))||[];
    const dates=trackerData.map(d=>d.date);
    const times=trackerData.map(d=>parseInt(d.time));
    const moodColors=trackerData.map(d=>{
        switch(d.mood){
            case '😄 Confident': return 'rgba(72,201,176,0.8)';
            case '😐 Okay': return 'rgba(241,196,15,0.8)';
            case '😣 Confused': return 'rgba(231,76,60,0.8)';
            case '😴 Tired': return 'rgba(149,165,166,0.8)';
            default: return 'rgba(52,152,219,0.8)';
        }
    });

    if(moodChartInstance) moodChartInstance.destroy();
    moodChartInstance=new Chart(document.getElementById('moodChart'),{
        type:'bar',
        data:{labels:dates,datasets:[{
            label:'Mood',
            data:times,
            backgroundColor:moodColors,
            borderRadius:10,
            borderSkipped:false
        }]},
        options:{
            plugins:{legend:{display:false}},
            scales:{y:{beginAtZero:true}},
            animation:{duration:1000, easing:'easeOutQuart'}
        }
    });

    if(timeChartInstance) timeChartInstance.destroy();
    timeChartInstance=new Chart(document.getElementById('timeChart'),{
        type:'line',
        data:{labels:dates,datasets:[{
            label:'Time Spent (min)',
            data:times,
            borderColor:'rgba(74,144,226,0.8)',
            backgroundColor:'rgba(74,144,226,0.2)',
            tension:0.4,
            fill:true,
            pointRadius:6
        }]},
        options:{
            responsive:true,
            plugins:{legend:{display:true}},
            scales:{y:{beginAtZero:true}},
            animation:{duration:1200, easing:'easeOutCubic'}
        }
    });
}

// SAVE TRACKER
document.getElementById('saveTracker').addEventListener('click',()=>{
    const mood=document.getElementById('mood').value;
    const time=document.getElementById('timeSpent').value;
    const key=`${currentSkill}_tracker`;
    const trackerData=JSON.parse(localStorage.getItem(key))||[];
    trackerData.push({mood,time,date:new Date().toLocaleDateString()});
    localStorage.setItem(key,JSON.stringify(trackerData));
    document.getElementById('trackerStatus').textContent=`Saved: Mood ${mood}, Time ${time} min`;
    updateCharts();
});

// LOAD ENTRIES FOR TAB
function loadSkillEntries(skill){sections.forEach(section=>{const container=document.getElementById(sectionMap(section)); container.innerHTML=''; const data=JSON.parse(localStorage.getItem(`${skill}_${section}`))||[]; data.forEach(item=>addToUI(section,item));}); updateCharts();}

// GROWTH LETTER
document.getElementById('generateLetter').addEventListener('click',()=>{
    let letter=`Dear Me,\n\nThis month in ${currentSkill} skill:\n\n`;
    sections.forEach(section=>{
        const data=JSON.parse(localStorage.getItem(`${currentSkill}_${section}`))||[];
        if(data.length){letter+=`- ${section.charAt(0).toUpperCase()+section.slice(1)}:\n`; data.forEach(d=>letter+=`   • ${d}\n`);}
    });
    letter+=`\nKeep growing and keep showing up!\n\nYour Future Self`;
    document.getElementById('growthLetter').textContent=letter;
});

// EXPORT PDF
document.getElementById('exportPDF').addEventListener('click',()=>{
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const letter=document.getElementById('growthLetter').textContent;
    const lines=doc.splitTextToSize(letter,180);
    doc.text(lines,10,10);
    doc.save(`GrowthLetter_${currentSkill}.pdf`);
});
