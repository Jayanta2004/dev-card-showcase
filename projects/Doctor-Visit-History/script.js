document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('visitForm');
    const timeline = document.getElementById('timeline');
    const generalNotesTextarea = document.getElementById('generalNotes');
    const saveNotesBtn = document.getElementById('saveNotes');
    
    // Load existing data
    loadVisits();
    loadGeneralNotes();
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const date = document.getElementById('date').value;
        const doctor = document.getElementById('doctor').value;
        const specialty = document.getElementById('specialty').value;
        const diagnosis = document.getElementById('diagnosis').value;
        const medications = document.getElementById('medications').value;
        const notes = document.getElementById('notes').value;
        
        const visit = {
            date,
            doctor,
            specialty,
            diagnosis,
            medications,
            notes,
            timestamp: new Date().getTime()
        };
        
        saveVisit(visit);
        loadVisits();
        
        // Reset form
        form.reset();
        document.getElementById('date').valueAsDate = new Date();
    });
    
    saveNotesBtn.addEventListener('click', function() {
        const notes = generalNotesTextarea.value;
        localStorage.setItem('generalNotes', notes);
        alert('Notes saved!');
    });
    
    function saveVisit(visit) {
        let visits = JSON.parse(localStorage.getItem('doctorVisits')) || [];
        visits.push(visit);
        localStorage.setItem('doctorVisits', JSON.stringify(visits));
    }
    
    function loadVisits() {
        const visits = JSON.parse(localStorage.getItem('doctorVisits')) || [];
        visits.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        timeline.innerHTML = '';
        visits.forEach(visit => {
            const visitDiv = document.createElement('div');
            visitDiv.className = 'visit-item';
            
            visitDiv.innerHTML = `
                <div class="visit-date">${formatDate(visit.date)}</div>
                <div class="visit-doctor">${visit.doctor}${visit.specialty ? ` (${visit.specialty})` : ''}</div>
                <div class="visit-diagnosis">${visit.diagnosis}</div>
                <div class="visit-details">
                    ${visit.medications ? `<strong>Medications:</strong> ${visit.medications}<br>` : ''}
                    ${visit.notes ? `<strong>Notes:</strong> ${visit.notes}` : ''}
                </div>
            `;
            
            timeline.appendChild(visitDiv);
        });
    }
    
    function loadGeneralNotes() {
        const notes = localStorage.getItem('generalNotes') || '';
        generalNotesTextarea.value = notes;
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
    
    // Set default date to today
    document.getElementById('date').valueAsDate = new Date();
});