// The pq-crystals-js library is loaded globally as pqcrystals

document.addEventListener('DOMContentLoaded', function() {
    const generateKeysBtn = document.getElementById('generateKeysBtn');
    const signBtn = document.getElementById('signBtn');
    const verifyBtn = document.getElementById('verifyBtn');
    const publicKeySpan = document.getElementById('publicKey');
    const privateKeySpan = document.getElementById('privateKey');
    const signatureSpan = document.getElementById('signature');
    const verificationResultSpan = document.getElementById('verificationResult');
    const challengeInput = document.getElementById('challenge');

    let publicKey, privateKey, signature;

    // Generate keys
    generateKeysBtn.addEventListener('click', function() {
        try {
            // Generate Dilithium keypair
            const keypair = pqcrystals.dilithium.keypair();
            publicKey = keypair.publicKey;
            privateKey = keypair.privateKey;

            // Display keys as hex (in a real app, never display private key)
            publicKeySpan.textContent = arrayBufferToHex(publicKey);
            privateKeySpan.textContent = 'Generated (not displayed for security)';

            signBtn.disabled = false;
            generateKeysBtn.textContent = 'Keys Generated';
            generateKeysBtn.disabled = true;
        } catch (error) {
            console.error('Key generation failed:', error);
            alert('Key generation failed. Please check the console for details.');
        }
    });

    // Sign challenge
    signBtn.addEventListener('click', function() {
        try {
            const challenge = challengeInput.value;
            const encoder = new TextEncoder();
            const data = encoder.encode(challenge);

            signature = pqcrystals.dilithium.sign(data, privateKey);

            // Display signature as hex
            signatureSpan.textContent = arrayBufferToHex(signature);

            verifyBtn.disabled = false;
        } catch (error) {
            console.error('Signing failed:', error);
            alert('Signing failed.');
        }
    });

    // Verify signature
    verifyBtn.addEventListener('click', function() {
        try {
            const challenge = challengeInput.value;
            const encoder = new TextEncoder();
            const data = encoder.encode(challenge);

            const isValid = pqcrystals.dilithium.verify(signature, data, publicKey);

            verificationResultSpan.textContent = isValid ? 'Valid' : 'Invalid';
            verificationResultSpan.style.color = isValid ? 'green' : 'red';
        } catch (error) {
            console.error('Verification failed:', error);
            alert('Verification failed.');
        }
    });

    function arrayBufferToHex(buffer) {
        return Array.from(new Uint8Array(buffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
});