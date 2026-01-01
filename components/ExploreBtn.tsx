"use client";

const ExploreBtn = () => {
  return (
    <button type="button" id="explore-btn">
      <a href="#events">
        Explore Events
        <img
          src="/icons/arrow-down.svg"
          alt="arrow-down"
          width={24}
          height={24}
          style={{ width: "auto", height: "auto" }}
        />
      </a>
    </button>
  );
};
export default ExploreBtn;
