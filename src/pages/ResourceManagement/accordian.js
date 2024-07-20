export const Accordian=(props)=>{
    return (
        <div class="accordion accordion-flush" id="accordionFlushExample">
  <div class="accordion-item">
    <h2 class="accordion-header" id="flush-headingOne">
      <button class="accordion-button collapsed" type="button" style={{
        fontWeight:500
    }} data-bs-toggle="collapse" data-bs-target="#flush-collapseOne" aria-expanded="false" aria-controls="flush-collapseOne">
      <bold className="me-2 text-bold" style={{
        fontSize:"25px",
        fontWeight:600
      }}>{props.num1 ? props.num1:15}</bold> {props.heading ? props.heading:"Pending Resource Requests" }
      </button>
    </h2>
    <div id="flush-collapseOne" class="accordion-collapse collapse"  aria-labelledby="flush-headingOne" data-bs-parent="#accordionFlushExample">
      <div class="accordion-body">Placeholder content for this accordion, which is intended to demonstrate the <code>.accordion-flush</code> class. This is the first item's accordion body.</div>
    </div>
  </div>
  <div class="accordion-item">
    <h2 class="accordion-header" id="flush-headingTwo">
    <button class="accordion-button collapsed" style={{
        fontWeight:500
    }} type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseTwo" aria-expanded="false" aria-controls="flush-collapseOne">
      <bold className="me-2 text-bold" style={{
        fontSize:"25px",
        fontWeight:600
      }}>{props.num2 ? props.num2:1}</bold> {props.sub ?props.sub :"Proposed Resources not accepted"}
      </button>
    </h2>
    <div id="flush-collapseTwo" class="accordion-collapse collapse" aria-labelledby="flush-headingTwo" data-bs-parent="#accordionFlushExample">
      <div class="accordion-body">Placeholder content for this accordion, which is intended to demonstrate the <code>.accordion-flush</code> class. This is the second item's accordion body. Let's imagine this being filled with some actual content.</div>
    </div>
  </div>
</div>
    )
}