import { NodeModel } from "@patternfly/react-topology";
import { useContext, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";
// import Donut from "../abroad/widgets/Donut";

type DiagramSideBarProps = {
  node: NodeModel;
};

const DiagramSideBar = ({ node }: DiagramSideBarProps) => {
  const { confirmAlarm } = useContext(AuthContext);

  console.log(node);
  useEffect(() => {
    // confirmAlarm(node.data.ipAddress);
  }, []);
  return (
    <div style={{ marginTop: 27, marginLeft: 20, height: "800px" }}>
      <div>
        <h4 className="mt-8 mb-4 mr-12 text-center text-2xl font-bold">
          {node.label}
        </h4>
      </div>
      <div className="flex mt-64">
        <h6 className="mt-8 mb-4 mr-12 text-lg font-semibold">IP Address:</h6>
        <h6 className="mt-8 mb-4">
          <span className="bg-blue-500 text-white px-2 py-1 rounded">
            {node.data.ipAddress}
          </span>
          {/* {node.data.SERVER && ` (${node.data.SERVER})`} */}
        </h6>
      </div>
      <div className="flex mt-8">
        <h6 className="mt-8 mb-4 mr-12 text-lg font-semibold">CPU:</h6>
        <h6 className="mt-8 mb-4 mr-24">
          {node.data.CPU && (
            <span className="bg-blue-600 text-white px-2 py-1 rounded">{`${node.data.CPU}%`}</span>
          )}
        </h6>
        <h6 className="mt-8 mb-4 mr-12 text-lg font-semibold">RAM:</h6>
        <h6 className="mt-8 mb-4">
          {node.data.RAM && (
            <span className="bg-green-600 text-white px-2 py-1 rounded">{`${node.data.RAM}%`}</span>
          )}
        </h6>
      </div>
      <div className="flex mt-8">
        <h6 className="mt-8 mb-4 mr-12 text-lg font-semibold">
          iptables state:
        </h6>
        {node.data.IPTABLES === "active" && (
          <div className="bg-green-200 text-green-800 px-2 py-1 rounded">
            Active
          </div>
        )}
        {node.data.IPTABLES === "inactive" && (
          <div className="bg-red-200 text-red-800 px-2 py-1 rounded">
            Disabled
          </div>
        )}
      </div>
      <div className="flex mt-8">
        <div className="mb-4 mr-12">
          <div className="flex mt-8">
            <h6 className="mt-8 mb-4 mr-12 text-lg font-semibold">
              Physical Blocker:
            </h6>
            {node.data.NIS?.success === "true" && (
              <div className="bg-green-200 text-green-800 px-2 py-1 rounded">
                success
              </div>
            )}
            {node.data.NIS?.success === "false" && (
              <div className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                Warning Last time: {node.data.NIS?.time}
              </div>
            )}
          </div>
          <div className="flex mt-8">
            <h6 className="mt-8 mb-4 mr-12 text-lg font-semibold">FS:</h6>
            <div className="mt-8 mb-4 mr-12">
              {node.data.FS?.success === "true" && (
                <div className="bg-green-200 text-green-800 px-2 py-1 rounded">
                  Success
                </div>
              )}
              {node.data.FS?.success === "false" && (
                <div className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                  Warning Last time: {node.data.FS?.time}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex mt-8">
        <h6 className="mt-8 mb-4 mr-12 text-lg font-semibold">
          hard info /home:
        </h6>
      </div>
      {/* <div>
        <Donut
          labels={["Used", "Free"]}
          series={[node.data.HARD_HOME, 100 - node.data.HARD_HOME]}
          type={"pie"}
        />
      </div> */}
      <div className="flex mt-8">
        <h6 className="mt-8 mb-4 mr-12 text-lg font-semibold">
          Hard info /var/log:
        </h6>
      </div>
      <div>
        {/* <Donut
          labels={["Used", "Free"]}
          series={[node.data.HARD_LOG, 100 - node.data.HARD_LOG]}
          type={"pie"}
        /> */}
      </div>
    </div>
  );
};

export default DiagramSideBar;
