import { Graph } from "./core/graph.js";
import { Executor } from "./core/executor.js";
import { Sidebar } from "./ui/sidebar.js";

const graph = new Graph();
const executor = new Executor(graph);

const sidebar = new Sidebar(graph, null, executor);
sidebar.init();