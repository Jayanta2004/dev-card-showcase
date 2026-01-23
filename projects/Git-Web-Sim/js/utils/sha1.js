/**
 * GIT-WEB CRYPTO KERNEL
 * =========================================
 * A pure JavaScript implementation of the Secure Hash Algorithm 1 (SHA-1).
 * Git uses SHA-1 to generate the unique 40-character Object IDs (OIDs)
 * for every blob, tree, and commit.
 *
 * This implementation operates on raw strings and handles the UTF-8 encoding
 * and big-endian word conversion required by the spec.
 *
 * @module utils/sha1
 */

const SHA1 = (function() {
    'use strict';

    /**
     * Bitwise rotate a 32-bit number to the left.
     * @param {number} n - The number to rotate.
     * @param {number} s - The number of bits to rotate by.
     * @returns {number} The rotated number.
     */
    function rotateLeft(n, s) {
        return (n << s) | (n >>> (32 - s));
    }

    /**
     * Convert a 32-bit integer to a hex string (8 chars).
     * @param {number} num - The integer.
     * @returns {string} Hex representation.
     */
    function hex(num) {
        let str = "";
        for (let i = 7; i >= 0; i--) {
            str += ((num >>> (i * 4)) & 0xf).toString(16);
        }
        return str;
    }

    /**
     * The core SHA-1 Hashing Function.
     * @param {string} str - The input string (raw content).
     * @returns {string} The 40-character hex hash.
     */
    function hash(str) {
        // 1. Pre-processing: Encode as UTF-8
        // Git treats content as a byte stream. In JS, strings are UTF-16.
        // We use unescape(encodeURIComponent) to turn standard strings into
        // a binary-safe format where chars match bytes (0-255).
        const msg = unescape(encodeURIComponent(str));
        const len = msg.length;
        
        // Convert string to an array of big-endian words
        // Each character becomes 8 bits.
        const words = [];
        for (let i = 0; i < len; i++) {
            words[i >>> 2] |= (msg.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
        }
        
        // Padding: Append '1' bit (0x80)
        words[len >>> 2] |= 0x80 << (24 - (len % 4) * 8);
        
        // Append length (in bits) at the end of the block
        // SHA-1 block size is 512 bits. We pad until the last 64 bits.
        words[(((len + 8) >>> 6) << 4) + 15] = len * 8;

        // 2. Initialize Hash State (H0...H4)
        // Magic constants defined by the SHA-1 standard
        let H = [
            0x67452301, 
            0xefcdab89, 
            0x98badcfe, 
            0x10325476, 
            0xc3d2e1f0
        ];

        // 3. Process Blocks (512 bits / 16 words at a time)
        const K = [
            0x5a827999, 
            0x6ed9eba1, 
            0x8f1bbcdc, 
            0xca62c1d6
        ];

        for (let i = 0; i < words.length; i += 16) {
            // Expand the 16 words into 80 words
            const W = new Array(80);
            
            // Working variables
            let a = H[0];
            let b = H[1];
            let c = H[2];
            let d = H[3];
            let e = H[4];

            for (let j = 0; j < 80; j++) {
                if (j < 16) {
                    W[j] = words[i + j] || 0; // Handle potential undefined padding
                } else {
                    // W[j] = S^1(W[j-3] XOR W[j-8] XOR W[j-14] XOR W[j-16])
                    W[j] = rotateLeft(
                        W[j - 3] ^ W[j - 8] ^ W[j - 14] ^ W[j - 16], 
                        1
                    );
                }

                let f, k;
                
                // Determine logical function and constant based on round
                if (j < 20) { 
                    f = (b & c) | ((~b) & d); 
                    k = K[0]; 
                } else if (j < 40) { 
                    f = b ^ c ^ d; 
                    k = K[1]; 
                } else if (j < 60) { 
                    f = (b & c) | (b & d) | (c & d); 
                    k = K[2]; 
                } else { 
                    f = b ^ c ^ d; 
                    k = K[3]; 
                }

                // Temp = S^5(a) + f + e + k + W[j]
                const temp = (rotateLeft(a, 5) + f + e + k + W[j]) >>> 0;
                
                // Shift variables
                e = d;
                d = c;
                c = rotateLeft(b, 30);
                b = a;
                a = temp;
            }

            // Add the compressed chunk to the current hash value
            H[0] = (H[0] + a) >>> 0;
            H[1] = (H[1] + b) >>> 0;
            H[2] = (H[2] + c) >>> 0;
            H[3] = (H[3] + d) >>> 0;
            H[4] = (H[4] + e) >>> 0;
        }

        // 4. Produce final hash
        // Concatenate H0..H4 as hex strings
        return H.map(hex).join("");
    }

    return {
        hash: hash
    };

})();

/**
 * GIT OBJECT HASHER
 * =================
 * Wraps the raw SHA-1 function to simulate Git's internal object hashing.
 * * In Git, an object is not just hashed by its content. It is hashed by:
 * "<type> <length>\0<content>"
 * * Example: "blob 12\0Hello World!"
 */
const GitHasher = {
    
    /**
     * Generate the OID for a blob (file content).
     * @param {string} content - The file content.
     */
    blob: (content) => {
        // Git calculates length in bytes, not chars. 
        // For simplicity in this text-based sim, we use string length
        // but robust implementation uses Blob size.
        const header = `blob ${content.length}\0`;
        return SHA1.hash(header + content);
    },

    /**
     * Generate the OID for a tree (directory listing).
     * @param {string} serializedTree - The formatted tree string.
     */
    tree: (serializedTree) => {
        const header = `tree ${serializedTree.length}\0`;
        return SHA1.hash(header + serializedTree);
    },

    /**
     * Generate the OID for a commit.
     * @param {string} serializedCommit - The formatted commit message.
     */
    commit: (serializedCommit) => {
        const header = `commit ${serializedCommit.length}\0`;
        return SHA1.hash(header + serializedCommit);
    }
};

// Export for usage in other modules
if (typeof window !== 'undefined') {
    window.GitHasher = GitHasher;
}