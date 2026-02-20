/**
 * GhostLink Peer Discovery Protocol
 * Handles the "presence" of other nodes in the network.
 */
(function (global) {
    'use strict';

    if (!global.GhostState) {
        throw new Error('GhostState must be loaded before Peers');
    }

    const HEARTBEAT_INTERVAL = 2000;
    const PEER_TIMEOUT = 5000; // If no heartbeat in 5s, peer is dead
    const PEER_PREFIX = 'PEER_';

    class PeerManager {
        constructor() {
            this.peers = new Map(); // Map<id, peerData>
            this.timer = null;
            this.state = global.GhostState;
            this.myId = this.state.getIdentity().id;

            // Bindings
            this.pulse = this.pulse.bind(this);
            this.scan = this.scan.bind(this);
            this.cleanup = this.cleanup.bind(this);

            // Start lifecycle
            this.start();

            // Listen for immediate "I'm here" broadcasts
            this.state.on('broadcastMessage', (msg) => {
                if (msg.type === 'HELLO') {
                    this.handleHello(msg.payload);
                }
                if (msg.type === 'GOODBYE') {
                    this.handleGoodbye(msg.sender);
                }
            });

            // Announce self immediately
            this.announce();

            console.log('[Peers] Discovery Protocol Started');
        }

        start() {
            // Heartbeat loop
            this.timer = setInterval(() => {
                if (!this.state.isSimulatedOffline()) {
                    this.pulse();
                    this.scan();
                    this.cleanup();
                }
            }, HEARTBEAT_INTERVAL);

            // Also run one immediately
            this.pulse();
            this.scan();
        }

        stop() {
            clearInterval(this.timer);
            this.withdraw();
        }

        /**
         * Write my own heartbeat to persistence
         */
        pulse() {
            const identity = this.state.getIdentity();
            const payload = {
                ...identity,
                lastSeen: Date.now(),
                status: 'active' // could be 'idle', 'typing' etc
            };

            // We write to a unique key for this peer
            this.state.persist(PEER_PREFIX + this.myId, payload);
        }

        /**
         * Remove self from persistence
         */
        withdraw() {
            this.state.remove(PEER_PREFIX + this.myId);
            this.state.broadcast('GOODBYE', { id: this.myId });
        }

        /**
         * Announce presence immediately (for faster discovery than polling)
         */
        announce() {
            this.state.broadcast('HELLO', this.state.getIdentity());
        }

        /**
         * Read storage to find other peers
         */
        scan() {
            const rawPeers = this.state.scan(PEER_PREFIX);
            const foundIds = new Set();
            let changed = false;

            rawPeers.forEach(item => {
                const data = item.value.data; // .data represents the payload inside wrapper
                const id = data.id;

                if (id === this.myId) return;

                foundIds.add(id);

                if (!this.peers.has(id)) {
                    // New peer found
                    this.peers.set(id, data);
                    this.state.emit('peerJoined', data);
                    changed = true;
                    // console.log(`[Peers] Found new peer: ${data.name}`);
                } else {
                    // Update existing
                    const existing = this.peers.get(id);
                    if (existing.lastSeen < data.lastSeen) {
                        this.peers.set(id, data);
                        // Potential for 'peerUpdated' event here if needed
                    }
                }
            });
        }

        /**
         * Remove stale peers
         */
        cleanup() {
            const now = Date.now();
            const toRemove = [];

            this.peers.forEach((peer, id) => {
                if (now - peer.lastSeen > PEER_TIMEOUT) {
                    toRemove.push(id);
                }
            });

            toRemove.forEach(id => {
                const peer = this.peers.get(id);
                this.peers.delete(id);
                this.state.emit('peerLeft', peer);
                changed = true;
                // console.log(`[Peers] Peer timeout: ${peer.name}`);
            });
        }

        /**
         * Direct "Hello" handler
         */
        handleHello(peerData) {
            if (peerData.id === this.myId) return;

            if (!this.peers.has(peerData.id)) {
                this.peers.set(peerData.id, { ...peerData, lastSeen: Date.now() });
                this.state.emit('peerJoined', peerData);
            }
        }

        /**
         * Direct "Goodbye" handler
         */
        handleGoodbye(peerId) {
            if (this.peers.has(peerId)) {
                const p = this.peers.get(peerId);
                this.peers.delete(peerId);
                this.state.emit('peerLeft', p);
            }
        }

        /**
         * Get list of active peers
         */
        getActivePeers() {
            return Array.from(this.peers.values());
        }

        /**
         * Get a specific peer by ID
         */
        getPeer(id) {
            return this.peers.get(id);
        }

        /**
         * Count active peers
         */
        count() {
            return this.peers.size;
        }
    }

    // Handle closing the tab
    window.addEventListener('beforeunload', () => {
        if (global.GhostPeers) {
            global.GhostPeers.withdraw();
        }
    });

    global.GhostPeers = new PeerManager();

})(window);
