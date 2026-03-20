class Node {
    constructor(x, y, z, parent = null) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.parent = parent;
        this.g = 0;
        this.h = 0;
        this.f = 0;
    }

    set (x,y,z,parent,g,h){
        this.x = x;
        this.y = y;
        this.z = z;
        this.parent = parent;
        this.g = g;
        this.h = h;
        this.f = g+h;
        return this
    }
}

function reconstructPath (node) {
  const path = []
  while (node.parent) {
    path.push(node.data)
    node = node.parent
  }
  return path.reverse() // à l'envers donc on le retourne;
}



class AStar{
    constructor (posdeb,posfin,movements,timeout){
        this.movements = movements;
        this.posdeb = posdeb;
        this.posfin = posfin;
        this.timeout = timeout;

    }
    heuristic (){
        return Math.abs(this.posfin.x-this.posdeb.x)+Math.abs(this.posfin.y-this.posdeb.y)+Math.abs(this.posfin.z-this.posdeb.z)
    }
    

}