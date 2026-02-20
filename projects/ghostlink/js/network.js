/**
 * GhostLink Network Simulation Layer
 * Responsible for the "physics" of the connection: Latency, Packet Loss, Routing.
 * ALSO contains the Crypto Layer (merged for file count constraints).
 */
(function (global) {
    'use strict';

    if (!global.GhostState) throw new Error('GhostState required');

    // --- CRYPTO LAYER ---
    class CryptoLayer {
        constructor() {
            this.keys = new Map(); // PeerID -> SharedKey
            this.myKeyPair = this._generateKeyPair();
            console.log('[Crypto] Layer Initialized. Public Key Generated.');
        }

        _generateKeyPair() {
            return {
                public: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                private: Math.random().toString(36).substring(2, 15)
            };
        }

        deriveSessionKey(peerId, peerPublicKey) {
            const sharedSecret = this.myKeyPair.private + peerPublicKey;
            const sessionHash = this._hash(sharedSecret);
            this.keys.set(peerId, sessionHash);
            return sessionHash;
        }

        hasSession(peerId) {
            return this.keys.has(peerId);
        }

        encrypt(text, peerId) {
            const key = this.keys.get(peerId) || 'default_unsecure_channel';
            return this._xorCipher(text, key);
        }

        decrypt(cipherText, peerId) {
            const key = this.keys.get(peerId) || 'default_unsecure_channel';
            return this._xorCipher(cipherText, key);
        }

        _xorCipher(text, key) {
            let result = '';
            for (let i = 0; i < text.length; i++) {
                const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
                result += String.fromCharCode(charCode);
            }
            return btoa(result);
        }

        decryptRaw(base64, peerId) {
            try {
                const text = atob(base64);
                const key = this.keys.get(peerId) || 'default_unsecure_channel';
                let result = '';
                for (let i = 0; i < text.length; i++) {
                    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
                    result += String.fromCharCode(charCode);
                }
                return result;
            } catch (e) {
                return '[DECRYPTION_FAIL]';
            }
        }

        _hash(str) {
            let hash = 0;
            if (str.length === 0) return hash.toString();
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return Math.abs(hash).toString(16).repeat(4).substring(0, 32);
        }
    }

    // --- NETWORK LAYER ---
    class NetworkLayer {
        constructor() {
            this.state = global.GhostState;
            this.crypto = new CryptoLayer();
            this.config = {
                minLatency: 300,
                maxLatency: 2500,
                packetLossChance: 0.15, // 15% failure rate
                jitter: 0.2
            };
        }

        /**
         * Simulates sending a packet over the wire.
         */
        transmit(packet) {
            return new Promise(async (resolve, reject) => {
                // 1. Calculate realistic latency
                const latency = this._calculateLatency();
                const hops = this._generateRoute(packet.from, packet.to);

                // 2. Simulate Hops
                // We divide the total latency by the number of hops to sync the animation
                const delayPerHop = latency / hops.length;

                for (let i = 0; i < hops.length; i++) {
                    const hop = hops[i];

                    // Emit hop event
                    this.state.emit('network:routing', {
                        id: packet.id,
                        hop: hop,
                        target: packet.to
                    });

                    // Wait for hop latency
                    await this._wait(delayPerHop);

                    // Check offline at each hop
                    if (this.state.isSimulatedOffline()) {
                        return reject(new Error('OFFLINE_MODE'));
                    }
                }

                // 3. RNG God determines fate (Packet Loss)
                if (Math.random() < this.config.packetLossChance) {
                    this.state.emit('network:loss', { id: packet.id });
                    return reject(new Error('PACKET_LOSS'));
                }

                // 4. Success
                resolve();
            });
        }

        /**
         * Simulates the "download" side when a message is found on the network
         */
        receive(packetId) {
            return new Promise((resolve) => {
                // Incoming messages are usually faster, but still have latency
                const latency = this._calculateLatency() * 0.5;
                setTimeout(() => {
                    resolve();
                }, latency);
            });
        }

        _calculateLatency() {
            const base = this.config.minLatency + Math.random() * (this.config.maxLatency - this.config.minLatency);
            const jitter = base * this.config.jitter * (Math.random() > 0.5 ? 1 : -1);
            return Math.floor(base + jitter);
        }

        _wait(ms) {
            return new Promise(r => setTimeout(r, ms));
        }

        _generateRoute(from, to) {
            // Fake route generation
            const routes = [
                'GATEWAY_LOCAL',
                `ISP_NODE_${Math.floor(Math.random() * 9)}`,
                'BACKBONE_CORE',
                `ISP_NODE_${Math.floor(Math.random() * 9)}`,
                'GATEWAY_TARGET'
            ];
            return routes;
        }

        ping(targetId) {
            this.state.emit('network:ping', { target: targetId });
        }
    }

    global.GhostNetwork = new NetworkLayer();

})(window);
