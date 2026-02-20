/**
 * GhostLink Message Protocol
 * Handles message creation, persistence, retries, and synchronization.
 */
(function (global) {
    'use strict';

    if (!global.GhostState || !global.GhostNetwork || !global.GhostPeers) {
        throw new Error('Dependencies missing for Messages');
    }

    const MSG_PREFIX = 'MSG_';
    const BOX_PREFIX = 'BOX_'; // Local persistence for history

    class MessageSystem {
        constructor() {
            this.state = global.GhostState;
            this.network = global.GhostNetwork;
            this.peers = global.GhostPeers;

            this.conversations = new Map(); // Map<PeerID, Array<Msgs>>
            this.queue = []; // Outgoing queue
            this.queueTimer = null;

            // Bindings
            this.processQueue = this.processQueue.bind(this);
            this.checkForMessages = this.checkForMessages.bind(this);

            // Rehydrate local history
            this._loadHistory();

            // Listen for storage events (incoming messages)
            this.state.on('storageUpdate', (change) => {
                if (change.key.startsWith(MSG_PREFIX) && change.newValue) {
                    this.checkForMessages(change.key, change.newValue);
                }
            });

            // Start queue processor
            setInterval(this.processQueue, 1000);

            // Initial scan
            this.scanForMessages();

            console.log('[Messages] System Online');
        }

        /**
         * Send a text message to a peer
         */
        sendMessage(text, toPeerId) {
            const me = this.state.getIdentity();

            // Encrypt content (Fake E2E)
            let encryptedText = text;
            if (this.network.crypto) {
                encryptedText = this.network.crypto.encrypt(text, toPeerId);
            }

            const msg = {
                id: this.state._generateUUID(),
                from: me.id,
                to: toPeerId,
                text: text, // Plaintext for local use
                payload: encryptedText, // Encrypted for transmission
                status: 'pending', // pending -> routing -> sent -> delivered -> failed
                timestamp: Date.now(),
                retries: 0
            };

            // Save locally
            this._saveLocal(msg);

            // Add to queue
            this.queue.push(msg);
            this.processQueue(); // Trigger immediately

            return msg;
        }

        /**
         * Process the outgoing queue
         */
        async processQueue() {
            if (this.state.isSimulatedOffline()) return;
            if (this.queue.length === 0) return;

            // Process one at a time for dramatic effect
            const msg = this.queue[0];

            // Check if max retries exceeded
            if (msg.retries > 3) {
                this._updateStatus(msg.id, 'failed');
                this.queue.shift(); // Remove
                return;
            }

            this._updateStatus(msg.id, 'routing');

            try {
                // Attempt transmission
                await this.network.transmit(msg);

                // If successful:
                // 1. Write to "Cloud" (LocalStorage) where recipient can see it
                // We wrap it to ensure it's detected as a message envelope
                const payload = {
                    ...msg,
                    serverTimestamp: Date.now()
                };

                this.state.persist(MSG_PREFIX + msg.id, payload);

                // 2. Mark as sent locally
                this._updateStatus(msg.id, 'sent');

                // 3. Remove from queue
                this.queue.shift();

            } catch (err) {
                console.warn(`[Messages] Transmission failed for ${msg.id}: ${err.message}`);
                msg.retries++;
                // Back to pending, wait for next cycle
                this._updateStatus(msg.id, 'pending');
            }
        }

        /**
         * Check specific key for incoming message
         */
        checkForMessages(key, data) {
            // data is { data: {msg...}, ... } from state wrapper
            const msg = data.data;
            const myId = this.state.getIdentity().id;

            // Is it for me?
            if (msg.to === myId) {
                // Is it new?
                if (!this._hasMessage(msg.id)) {
                    this._receiveMessage(msg);
                }
            }

            // Is it an ACK for me? (I sent it, they received it)
            if (msg.from === myId && msg.status === 'received') {
                this._markDelivered(msg.id);
            }
        }

        /**
         * Scan all storage for missed messages (sync)
         */
        scanForMessages() {
            const all = this.state.scan(MSG_PREFIX);
            all.forEach(item => {
                this.checkForMessages(item.key, item.value);
            });
        }

        /**
         * Handle incoming message logic
         */
        async _receiveMessage(msg) {
            // Simulate download delay
            this.state.emit('message:incoming', { id: msg.id, from: msg.from });

            await this.network.receive(msg.id);

            // Decrypt
            if (this.network.crypto && msg.payload) {
                msg.text = this.network.crypto.decrypt(msg.payload, msg.from);
            }

            // Store locally
            msg.status = 'received';
            this._saveLocal(msg);

            // Notify sender we got it (Update the record on the "cloud")
            const ackUpdate = { ...msg, status: 'received', receivedAt: Date.now() };
            this.state.persist(MSG_PREFIX + msg.id, ackUpdate);

            // Emit event for UI
            this.state.emit('message:received', msg);
        }

        /**
         * Mark an outgoing message as delivered (ACK received)
         */
        _markDelivered(msgId) {
            const stored = this._getLocal(msgId);
            if (stored && stored.status !== 'delivered') {
                this._updateStatus(msgId, 'delivered');
                // Cleanup cloud copy after a delay to save space (simulate garbage collection)
                setTimeout(() => {
                    this.state.remove(MSG_PREFIX + msgId);
                }, 5000);
            }
        }

        /**
         * Local History Management
         */
        _loadHistory() {
            const data = localStorage.getItem(BOX_PREFIX + this.state.getIdentity().id);
            if (data) {
                try {
                    const parsed = JSON.parse(data);
                    // Reconstruct Map
                    Object.keys(parsed).forEach(peerId => {
                        this.conversations.set(peerId, parsed[peerId]);
                    });
                } catch (e) {
                    console.error('Failed to load history');
                }
            }
        }

        _saveHistory() {
            // Serialize Map
            const obj = {};
            this.conversations.forEach((msgs, peerId) => {
                obj[peerId] = msgs;
            });
            localStorage.setItem(BOX_PREFIX + this.state.getIdentity().id, JSON.stringify(obj));
        }

        _saveLocal(msg) {
            const peerId = msg.from === this.state.getIdentity().id ? msg.to : msg.from;

            if (!this.conversations.has(peerId)) {
                this.conversations.set(peerId, []);
            }

            const list = this.conversations.get(peerId);
            // Check if exists
            const idx = list.findIndex(m => m.id === msg.id);
            if (idx >= 0) {
                list[idx] = msg;
            } else {
                list.push(msg);
            }

            // Sort by time
            list.sort((a, b) => a.timestamp - b.timestamp);

            this.conversations.set(peerId, list);
            this._saveHistory();

            // UI Update
            this.state.emit('history:updated', { peerId });
        }

        _updateStatus(msgId, status) {
            // Find message in all convos (inefficient but safe)
            this.conversations.forEach((list, peerId) => {
                const msg = list.find(m => m.id === msgId);
                if (msg) {
                    msg.status = status;
                    if (status === 'delivered') msg.deliveredAt = Date.now();
                    this.state.emit('history:updated', { peerId });
                }
            });
            this._saveHistory();
        }

        _getLocal(msgId) {
            for (let list of this.conversations.values()) {
                const found = list.find(m => m.id === msgId);
                if (found) return found;
            }
            return null;
        }

        _hasMessage(msgId) {
            return !!this._getLocal(msgId);
        }

        getHistory(peerId) {
            return this.conversations.get(peerId) || [];
        }

        getAllConversations() {
            return Array.from(this.conversations.keys());
        }
    }

    global.GhostMessages = new MessageSystem();

})(window);
